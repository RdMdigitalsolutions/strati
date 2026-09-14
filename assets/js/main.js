(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  document.getElementById('year').textContent = new Date().getFullYear();

  const revealPage = () => window.requestAnimationFrame(() => body.classList.add('loaded'));
  if (document.readyState === 'complete') revealPage();
  else window.addEventListener('load', revealPage, { once: true });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };

  menuButton.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  document.querySelectorAll('[data-lines]').forEach((heading) => {
    [...heading.children].forEach((line) => {
      const inner = document.createElement('i');
      inner.textContent = line.textContent;
      line.textContent = '';
      line.append(inner);
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal], [data-lines]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    revealTargets.forEach((target) => observer.observe(target));
  }

  const flavours = [
    { key: 'classic', name: 'Clásico', phrase: 'El sabor con el que empezó todo.', background: '#f4eee7' },
    { key: 'matcha', name: 'Matcha', phrase: 'No es lo que parece.', background: '#e2ead7' },
    { key: 'pistachio', name: 'Pistacho', phrase: 'Cremoso. Intenso. Irresistible.', background: '#e8e9c9' },
    { key: 'lemon', name: 'Limón', phrase: 'Hay sabores que solo aparecen una vez.', background: '#f5edb3' }
  ];

  const flavourSection = document.querySelector('.flavour-desktop');
  const flavourStage = document.querySelector('.flavour-stage');
  const flavourName = document.querySelector('[data-current-name]');
  const flavourPhrase = document.querySelector('[data-current-phrase]');
  const flavourCount = document.querySelector('[data-current-count]');
  const flavourProgress = document.querySelector('[data-flavour-progress]');
  let activeFlavour = 0;

  const switchFlavour = (index) => {
    if (index === activeFlavour) return;
    activeFlavour = index;
    const next = flavours[index];

    document.querySelectorAll('[data-flavour-image]').forEach((figure) => {
      const active = figure.dataset.flavourImage === next.key;
      figure.classList.toggle('is-active', active);
      figure.setAttribute('aria-hidden', String(!active));
    });

    flavourName.classList.remove('is-changing');
    void flavourName.offsetWidth;
    flavourName.classList.add('is-changing');
    window.setTimeout(() => {
      flavourName.textContent = next.name;
      flavourPhrase.textContent = next.phrase;
      flavourCount.textContent = String(index + 1).padStart(2, '0');
      flavourStage.style.setProperty('--flavour-bg', next.background);
    }, reduceMotion ? 0 : 285);
  };

  const header = document.querySelector('[data-header]');
  const ribbon = document.querySelector('[data-ribbon]');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;

  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 24);

    // IntersectionObserver can miss a target when a touchpad or Page Down jumps
    // across a full viewport. This lightweight check keeps masks dependable.
    revealTargets.forEach((target) => {
      if (target.classList.contains('is-visible')) return;
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * .94 && rect.bottom > 0) {
        target.classList.add('is-visible');
      }
    });

    if (!reduceMotion) {
      const ribbonSection = ribbon.parentElement;
      const ribbonRect = ribbonSection.getBoundingClientRect();
      const ribbonProgress = clamp((window.innerHeight - ribbonRect.top) / (window.innerHeight + ribbonRect.height), 0, 1);
      ribbon.style.transform = `translate3d(${-ribbonProgress * Math.min(window.innerWidth * .45, 560)}px, 0, 0)`;

      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const strength = Number(item.dataset.parallax || 0);
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * strength;
        item.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      });
    }

    if (window.innerWidth >= 900 && flavourSection) {
      const rect = flavourSection.getBoundingClientRect();
      const distance = flavourSection.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / distance, 0, .9999);
      const index = Math.min(flavours.length - 1, Math.floor(progress * flavours.length));
      switchFlavour(index);
      flavourProgress.style.transform = `scaleX(${(index + 1) / flavours.length})`;
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScrollEffects();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
