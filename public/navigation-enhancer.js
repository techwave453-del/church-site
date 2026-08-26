(() => {
  const groups = [
    { label: 'About', items: [{ label: 'About the Church', route: 'about' }, { label: 'Visit Us', route: 'visit-us' }] },
    { label: 'Ministries', items: [{ label: 'Service Times', route: 'events' }, { label: 'Membership Classes', route: 'resources' }] },
    { label: 'Media & Resources', items: [{ label: 'Media & Church Resources', route: 'media' }] },
    { label: 'Connect', items: [{ label: 'Give', route: 'give' }, { label: 'Contact', route: 'contact' }] },
    { label: 'More', items: [{ label: 'Terms & Conditions', href: '/terms.html' }] }
  ];

  const go = (route, closeMenu) => {
    closeMenu?.();
    if (route) window.location.hash = route === 'home' ? 'home' : `detail/${route}`;
  };

  const createLink = (item, closeMenu) => {
    const a = document.createElement('a');
    a.href = item.href || `#detail/${item.route}`;
    a.textContent = item.label;
    if (item.route) {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        go(item.route, closeMenu);
      });
    }
    return a;
  };

  function buildDesktop(nav) {
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true';
    nav.innerHTML = '';

    const home = document.createElement('a');
    home.href = '#home';
    home.textContent = 'Home';
    home.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      go('home');
    });
    nav.appendChild(home);

    groups.forEach((group) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'site-nav-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-nav-group-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div');
      submenu.className = 'site-nav-submenu';
      group.items.forEach((item) => submenu.appendChild(createLink(item)));
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.site-nav-group.open').forEach((other) => {
          if (other !== wrapper) {
            other.classList.remove('open');
            other.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false');
          }
        });
        const open = wrapper.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
        button.querySelector('span').textContent = open ? '−' : '+';
      });
      wrapper.append(button, submenu);
      nav.appendChild(wrapper);
    });
  }

  function buildMobile(drawer) {
    if (!drawer) return;
    const nav = drawer.querySelector('nav');
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true';
    nav.innerHTML = '';

    const closeMenu = () => drawer.querySelector('.close')?.click();
    const home = document.createElement('a');
    home.href = '#home';
    home.textContent = 'Home';
    home.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      go('home', closeMenu);
    });
    nav.appendChild(home);

    groups.forEach((group) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'site-mobile-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-mobile-group-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div');
      submenu.className = 'site-mobile-submenu';
      group.items.forEach((item) => submenu.appendChild(createLink(item, closeMenu)));
      button.addEventListener('click', () => {
        const open = wrapper.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
        button.querySelector('span').textContent = open ? '−' : '+';
      });
      wrapper.append(button, submenu);
      nav.appendChild(wrapper);
    });
  }

  function updateDesktopStickyState() {
    if (window.matchMedia('(max-width: 700px)').matches) return;
    const nav = document.querySelector('.navLinks');
    if (!nav) return;
    const page = document.querySelector('.page');
    const scrolled = window.scrollY > 8 || (page && page.scrollTop > 8);
    nav.classList.toggle('nav-stuck', !!scrolled);
  }

  function enhance() {
    buildDesktop(document.querySelector('.navLinks'));
    buildMobile(document.querySelector('.drawer'));
    updateDesktopStickyState();
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav-group')) {
      document.querySelectorAll('.site-nav-group.open').forEach((group) => {
        group.classList.remove('open');
        group.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false');
        group.querySelector('.site-nav-group-toggle span').textContent = '+';
      });
    }
  });

  window.addEventListener('scroll', updateDesktopStickyState, { passive: true });
  document.addEventListener('scroll', updateDesktopStickyState, { passive: true, capture: true });

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();