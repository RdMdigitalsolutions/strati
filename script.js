(() => {
  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finishLoading = () => {
    window.setTimeout(() => body.classList.add('loaded'), reduceMotion ? 0 : 280);
  };

  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading, { once: true });
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenu = () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  menuToggle.addEventListener('click', () => {
    const willOpen = !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', String(!willOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) closeMenu();
  });

  // Wrap words so headings reveal line by line without any external library.
  document.querySelectorAll('[data-reveal-words]').forEach((element) => {
    const words = element.textContent.trim().split(/\s+/);
    element.textContent = '';

    words.forEach((word, index) => {
      const mask = document.createElement('span');
      mask.className = 'word-mask';
      const inner = document.createElement('span');
      inner.textContent = word;
      inner.style.transitionDelay = `${Math.min(index * 32, 320)}ms`;
      mask.append(inner);
      element.append(mask);
      if (index < words.length - 1) element.append(document.createTextNode(' '));
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal], [data-reveal-words], .image-reveal:not(.hero__frame)');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Flavour visual: hover on desktop, click/focus everywhere.
  const flavourRows = [...document.querySelectorAll('[data-flavour]')];
  const flavourImages = [...document.querySelectorAll('[data-flavour-image]')];
  const flavourCounter = document.getElementById('flavour-current');

  const setFlavour = (flavour, index) => {
    flavourRows.forEach((row) => {
      const active = row.dataset.flavour === flavour;
      row.classList.toggle('is-active', active);
      row.setAttribute('aria-pressed', String(active));
    });

    flavourImages.forEach((image) => {
      const active = image.dataset.flavourImage === flavour;
      image.classList.toggle('is-active', active);
      image.setAttribute('aria-hidden', String(!active));
    });

    flavourCounter.textContent = index;
  };

  flavourRows.forEach((row) => {
    const activate = () => setFlavour(row.dataset.flavour, row.dataset.index);
    row.addEventListener('mouseenter', activate);
    row.addEventListener('focus', activate);
    row.addEventListener('click', activate);
  });

  // Header, progress, image parallax and moving statement.
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const statement = document.querySelector('.statement');
  let ticking = false;

  const updateScrollEffects = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
    header.classList.toggle('is-scrolled', y > 18);

    if (!reduceMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const strength = Number(item.dataset.parallax || 0.1);
        const centerOffset = (rect.top + rect.height / 2) - window.innerHeight / 2;
        const movement = Math.max(-8, Math.min(2, -5 - (centerOffset / window.innerHeight) * strength * 45));
        item.style.setProperty('--parallax-y', `${movement}%`);
      });

      if (statement) {
        const rect = statement.getBoundingClientRect();
        const progressInside = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const clamped = Math.max(0, Math.min(1, progressInside));
        statement.style.setProperty('--statement-shift', `${(clamped - 0.5) * 16}vw`);
      }
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  };

  updateScrollEffects();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);

  // Very restrained pointer tilt on the hero composition.
  const tiltTarget = document.querySelector('[data-tilt]');
  if (tiltTarget && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    tiltTarget.addEventListener('pointermove', (event) => {
      const rect = tiltTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltTarget.style.transform = `perspective(900px) rotateX(${y * -3.2}deg) rotateY(${x * 4.2}deg)`;
    });

    tiltTarget.addEventListener('pointerleave', () => {
      tiltTarget.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }
})();
