(() => {
  const groups = [
    { label: 'About', items: [{ label: 'About the Church', target: 'about' }, { label: 'Visit Us', target: 'visit' }] },
    { label: 'Ministries', items: [{ label: 'All Ministries', href: '/ministries.html' }, { label: 'Service Times', target: 'events' }, { label: 'Membership Classes', target: 'resources' }] },
    { label: 'Sermons', direct: true, href: '#detail/sermons' },
    { label: 'Events', items: [{ label: 'Church Events', target: 'events' }, { label: 'Visit Us', target: 'visit' }] },
    { label: 'Media', items: [{ label: 'Media & Church Resources', target: 'media' }] },
    { label: 'Give', direct: true, target: 'give' },
    { label: 'Contact', direct: true, target: 'contact' },
    { label: 'More', items: [{ label: 'Terms & Conditions', href: '/terms.html' }] }
  ];

  const isTermsPage = () => /(^|\/)terms\.html$/i.test(window.location.pathname);

  const scrollTo = (target) => {
    if (isTermsPage()) {
      if (target === 'home') window.location.href = '/?entered=1#home';
      else if (target === 'give' || target === 'contact') window.location.href = `/?entered=1#${target}`;
      else window.location.href = `/?entered=1#detail/${target}`;
      return;
    }
    const el = document.getElementById(target);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (target === 'home') window.location.href = '/?entered=1#home';
    else window.location.hash = `detail/${target}`;
  };

  const createLink = (item, closeMenu) => {
    const a = document.createElement('a');
    a.href = item.href || `#${item.target}`;
    a.textContent = item.label;
    if (item.target) {
      a.addEventListener('click', (event) => { event.preventDefault(); closeMenu?.(); scrollTo(item.target); });
    } else if (item.href?.startsWith('#detail/')) {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu?.();
        scrollTo(item.href.slice('#detail/'.length));
      });
    } else if (item.href === '/terms.html') {
      a.addEventListener('click', () => closeMenu?.());
    } else if (item.href === '/ministries.html') {
      a.addEventListener('click', () => closeMenu?.());
    }
    return a;
  };

  const createWatchLive = (closeMenu) => {
    const a = document.createElement('a');
    a.className = 'site-watch-live';
    a.href = '/live.html';
    a.innerHTML = '<span aria-hidden="true">▶</span><b>WATCH LIVE</b>';
    if (closeMenu) a.addEventListener('click', closeMenu);
    return a;
  };

  function buildDesktop(nav) {
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true';
    nav.innerHTML = '';
    const home = document.createElement('a');
    home.className = 'site-nav-home';
    home.href = '#home';
    home.textContent = 'Home';
    home.addEventListener('click', (e) => { e.preventDefault(); scrollTo('home'); });
    nav.appendChild(home);
    groups.forEach((group) => {
      if (group.direct) { nav.appendChild(createLink(group)); return; }
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
      });
      wrapper.append(button, submenu);
      nav.appendChild(wrapper);
    });
    nav.appendChild(createWatchLive());
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
    home.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); scrollTo('home'); });
    nav.appendChild(home);
    groups.forEach((group) => {
      if (group.direct) { nav.appendChild(createLink(group, closeMenu)); return; }
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
    nav.appendChild(createWatchLive(closeMenu));
  }

  function resolveLogo(value, depth = 0) {
    if (depth > 6 || value == null) return '';
    if (Array.isArray(value)) {
      for (const item of value) { const found = resolveLogo(item, depth + 1); if (found) return found; }
      return '';
    }
    if (typeof value === 'object') {
      for (const key of ['url','src','publicUrl','public_url','logoUrl','logo_url','fileUrl','file_url','href','path','logo','image','value']) {
        const found = resolveLogo(value[key], depth + 1); if (found) return found;
      }
      return '';
    }
    const raw = String(value).trim();
    if (!raw) return '';
    if (/^data:image\//i.test(raw) || /^blob:/i.test(raw)) return raw;
    try {
      const url = new URL(raw, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }

  function resolveMediaUrl(item) {
    return resolveLogo(item?.url || item?.publicUrl || item?.public_url || item?.fileUrl || item?.file_url || item?.path || item?.src || item?.image || item?.thumbnail || '');
  }

  async function hydrateTermsBrand() {
    if (!isTermsPage() || document.documentElement.dataset.termsBrandHydrated === 'true') return;
    document.documentElement.dataset.termsBrandHydrated = 'true';
    try {
      const response = await fetch('/api/site/content', { credentials: 'same-origin', cache: 'no-store' });
      const site = response.ok ? await response.json() : {};
      const name = String(site.churchName || site.name || '').trim();
      const tagline = String(site.tagline || '').trim();
      const nameEl = document.getElementById('churchName');
      const taglineEl = document.getElementById('churchTagline');
      const logoEl = document.getElementById('termsBrandLogo');
      const markEl = document.getElementById('termsBrandMark');
      if (name && nameEl) nameEl.textContent = name;
      if (tagline && taglineEl) taglineEl.textContent = tagline;
      if (name && logoEl) logoEl.alt = `${name} logo`;
      let logo = resolveLogo(site.logo || site.churchLogo || site.logoUrl);
      if (!logo) {
        const mediaResponse = await fetch('/api/media', { credentials: 'same-origin', cache: 'no-store' });
        const media = mediaResponse.ok ? await mediaResponse.json() : [];
        const list = Array.isArray(media) ? media : [];
        const item = list.find(entry => {
          const url = resolveMediaUrl(entry);
          const category = String(entry?.category || '').trim().toLowerCase();
          const title = String(entry?.title || entry?.name || '').trim().toLowerCase();
          return url && (category === 'logo' || title === 'logo' || title.includes('church logo'));
        });
        logo = resolveMediaUrl(item);
      }
      if (logo && logoEl) {
        logoEl.src = logo;
        logoEl.hidden = false;
        logoEl.style.display = 'block';
        if (markEl) { markEl.hidden = true; markEl.style.display = 'none'; }
        logoEl.onerror = () => {
          logoEl.hidden = true;
          logoEl.style.display = 'none';
          if (markEl) { markEl.hidden = false; markEl.style.display = 'grid'; }
        };
      }
    } catch (_) {}
  }

  function loadPublicPwaInstaller() {
    if (document.querySelector('script[data-public-pwa-installer]')) return;
    const script = document.createElement('script');
    script.src = '/pwa-install.js?v=1';
    script.dataset.publicPwaInstaller = 'true';
    script.async = true;
    document.head.appendChild(script);
  }

  function enhance() {
    document.querySelectorAll('.navLinks:not([data-grouped-navigation="true"])').forEach(buildDesktop);
    buildMobile(document.querySelector('.drawer:not(.detail-mobile-drawer)'));
    hydrateTermsBrand();
    loadPublicPwaInstaller();
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav-group')) {
      document.querySelectorAll('.site-nav-group.open').forEach((group) => {
        group.classList.remove('open');
        group.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  const initialize = () => {
    enhance();
    requestAnimationFrame(() => enhance());
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
