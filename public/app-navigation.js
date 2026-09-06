(() => {
  const navItems = [
    ['home', '⌂', 'Home'],
    ['live', '●', 'Live'],
    ['media', '▶', 'Media'],
    ['give', '♡', 'Give'],
    ['more', '☰', 'More']
  ];

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const scrollToTarget = (id) => {
    if (id === 'more') {
      const menuButton = document.querySelector('.mobile-menu-trigger, .menuIcon');
      menuButton?.click();
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateActive = (nav) => {
    const buttons = [...nav.querySelectorAll('[data-target]')];
    const sections = buttons
      .map((button) => document.getElementById(button.dataset.target))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      buttons.forEach((button) =>
        button.classList.toggle('active', button.dataset.target === visible.target.id)
      );
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.3, 0.6] });

    sections.forEach((section) => observer.observe(section));
  };

  const createNavigation = () => {
    if (!isStandalone() || document.getElementById('kfcc-mobile-app-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'kfcc-mobile-app-nav';
    nav.setAttribute('aria-label', 'App navigation');

    nav.innerHTML = navItems.map(([target, icon, label]) =>
      '<button type="button" data-target="' + target + '" aria-label="' + label + '">' +
        '<span class="kfcc-app-nav-icon" aria-hidden="true">' + icon + '</span>' +
        '<span>' + label + '</span>' +
      '</button>'
    ).join('');

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-target]');
      if (!button) return;
      scrollToTarget(button.dataset.target);
      if (button.dataset.target !== 'more') {
        nav.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
      }
    });

    document.body.appendChild(nav);
    nav.querySelector('[data-target="home"]')?.classList.add('active');
    updateActive(nav);
  };

  window.addEventListener('load', () => window.setTimeout(createNavigation, 250));
})();