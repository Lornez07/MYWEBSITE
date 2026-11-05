import './style.css';

document.documentElement.classList.add('js-enabled');

const header = document.querySelector('#site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const year = document.querySelector('#current-year');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const projectTabs = [...document.querySelectorAll('.workspace-project')];
const projectPanels = [
  ...document.querySelectorAll('.project-card[role="tabpanel"]'),
];
const projectCurrent = document.querySelector('.workspace-current');
const projectTitle = document.querySelector('.workspace-project-title');
const projectTabList = document.querySelector('.workspace-project-list');
const root = document.documentElement;

year.textContent = new Date().getFullYear();

function updateProjectTabOrientation() {
  projectTabList.setAttribute(
    'aria-orientation',
    window.matchMedia('(max-width: 1000px)').matches
      ? 'horizontal'
      : 'vertical',
  );
}

function updateScrollEffects() {
  const scrollY = window.scrollY;
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollableHeight > 0 ? Math.min(scrollY / scrollableHeight, 1) : 0;

  header.classList.toggle('is-scrolled', scrollY > 24);
  root.style.setProperty('--scroll-progress', progress.toFixed(4));

  if (reducedMotion.matches) {
    root.style.setProperty('--hero-parallax', '0px');
    return;
  }

  root.style.setProperty(
    '--hero-parallax',
    `${Math.min(scrollY * 0.1, 42)}px`,
  );
}

function selectProject(index, focusTab = false) {
  for (const [tabIndex, tab] of projectTabs.entries()) {
    const isSelected = tabIndex === index;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;

    const panel = projectPanels[tabIndex];
    panel.hidden = !isSelected;
    panel.classList.toggle('is-active', isSelected);
    panel.classList.remove('is-entering');
    if (isSelected) {
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
  }

  projectCurrent.textContent = String(index + 1).padStart(2, '0');
  projectTitle.textContent = projectPanels[index]
    .querySelector('h3')
    .textContent.trim();
  if (focusTab) projectTabs[index].focus();
}

for (const [index, tab] of projectTabs.entries()) {
  tab.addEventListener('click', () => selectProject(index));
}

projectTabList.addEventListener('keydown', (event) => {
    const activeIndex = projectTabs.indexOf(document.activeElement);
    if (activeIndex < 0) return;

    let nextIndex = activeIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = projectTabs.length - 1;
    else if (['ArrowDown', 'ArrowRight'].includes(event.key)) {
      nextIndex = (activeIndex + 1) % projectTabs.length;
    } else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) {
      nextIndex = (activeIndex - 1 + projectTabs.length) % projectTabs.length;
    } else return;

    event.preventDefault();
    selectProject(nextIndex, true);
  });

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute(
    'aria-label',
    isExpanded ? 'Open navigation' : 'Close navigation',
  );
  navigation.classList.toggle('is-open', !isExpanded);
});

navigation.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

let scrollTicking = false;
window.addEventListener(
  'scroll',
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateScrollEffects();
      scrollTicking = false;
    });
  },
  { passive: true },
);
updateScrollEffects();

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      entry.target.closest('.timeline')?.classList.add('is-active');
      observer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);

document.querySelectorAll('.reveal').forEach((element) => {
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const currentLink = navigation.querySelector(
        `a[href="#${entry.target.id}"]`,
      );
      if (!currentLink) continue;

      navigation.querySelector('.is-active')?.classList.remove('is-active');
      currentLink.classList.add('is-active');
    }
  },
  { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
);

document.querySelectorAll('main section[id]').forEach((section) => {
  sectionObserver.observe(section);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
  updateProjectTabOrientation();
  updateScrollEffects();
});
updateProjectTabOrientation();
reducedMotion.addEventListener('change', () => {
  updateScrollEffects();
});
