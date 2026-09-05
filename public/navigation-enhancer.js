(() => {
  const groups = [
    { label: 'About', items: [{ label: 'About the Church', target: 'about' }, { label: 'Visit Us', target: 'visit' }] },
    { label: 'Ministries', items: [{ label: 'Service Times', target: 'events' }, { label: 'Membership Classes', target: 'resources' }] },
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
        const target = item.href.slice('#detail/'.length);
        scrollTo(target);
      });
    } else if (item.href === '/terms.html') {
      a.addEventListener('click', () => closeMenu?.());
    }
    return a;
  };

  const createWatchLive = (closeMenu) => {
    const a = document.createElement('a'); a.className = 'site-watch-live'; a.href = '/live.html'; a.innerHTML = '<span aria-hidden="true">▶</span><b>WATCH LIVE</b>'; if (closeMenu) a.addEventListener('click', closeMenu); return a;
  };

  function buildDesktop(nav) {
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true'; nav.innerHTML = '';
    const home = document.createElement('a'); home.className = 'site-nav-home'; home.href = '#home'; home.textContent = 'Home'; home.addEventListener('click', (e) => { e.preventDefault(); scrollTo('home'); }); nav.appendChild(home);
    groups.forEach((group) => {
      if (group.direct) { nav.appendChild(createLink(group)); return; }
      const wrapper = document.createElement('div'); wrapper.className = 'site-nav-group';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'site-nav-group-toggle'; button.setAttribute('aria-expanded', 'false'); button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div'); submenu.className = 'site-nav-submenu'; group.items.forEach((item) => submenu.appendChild(createLink(item)));
      button.addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('.site-nav-group.open').forEach((other) => { if (other !== wrapper) { other.classList.remove('open'); other.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false'); } }); const open = wrapper.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); });
      wrapper.append(button, submenu); nav.appendChild(wrapper);
    });
    nav.appendChild(createWatchLive());
  }

  function buildMobile(drawer) {
    if (!drawer) return; const nav = drawer.querySelector('nav'); if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true'; nav.innerHTML = ''; const closeMenu = () => drawer.querySelector('.close')?.click();
    const home = document.createElement('a'); home.href = '#home'; home.textContent = 'Home'; home.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); scrollTo('home'); }); nav.appendChild(home);
    groups.forEach((group) => {
      if (group.direct) { nav.appendChild(createLink(group, closeMenu)); return; }
      const wrapper = document.createElement('div'); wrapper.className = 'site-mobile-group';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'site-mobile-group-toggle'; button.setAttribute('aria-expanded', 'false'); button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div'); submenu.className = 'site-mobile-submenu'; group.items.forEach((item) => submenu.appendChild(createLink(item, closeMenu)));
      button.addEventListener('click', () => { const open = wrapper.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); button.querySelector('span').textContent = open ? '−' : '+'; }); wrapper.append(button, submenu); nav.appendChild(wrapper);
    });
    nav.appendChild(createWatchLive(closeMenu));
  }

  function installDetailStyles() {
    if (document.getElementById('detail-navigation-style')) return;
    const style = document.createElement('style'); style.id = 'detail-navigation-style'; style.textContent = `
      header.detailHeader { position: sticky !important; top: 0 !important; z-index: 120 !important; min-height: 184px !important; height: 184px !important; padding: 0 !important; display: grid !important; grid-template-columns: minmax(0,1fr) !important; grid-template-rows: 126px 58px !important; align-items: center !important; justify-items: center !important; border-bottom: 0 !important; }
      header.detailHeader .detailBrand { grid-row: 1 !important; align-self: center !important; text-align: center !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 12px !important; }
      header.detailHeader .detailBrandLogo { width: 88px !important; height: 88px !important; max-width: 88px !important; max-height: 88px !important; object-fit: contain !important; }
      header.detailHeader .navLinks { grid-row: 2 !important; width: 100% !important; height: 58px !important; margin: 0 !important; padding: 0 24px !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: clamp(8px,1.2vw,20px) !important; align-self: stretch !important; }
      header.detailHeader .detailBack, header.detailHeader .detailMenu { display: none !important; }
      @media (max-width: 700px) {
        header.detailHeader { min-height: 70px !important; height: 70px !important; padding: 0 9px !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; }
        header.detailHeader .detailBrand { display: flex !important; width: auto !important; max-width: calc(100% - 58px) !important; height: 70px !important; padding: 8px 4px !important; justify-content: flex-start !important; text-align: left !important; gap: 8px !important; overflow: hidden !important; }
        header.detailHeader .detailBrandLogo { width: 42px !important; height: 42px !important; max-width: 42px !important; max-height: 42px !important; flex: 0 0 42px !important; }
        header.detailHeader .detailBrand > div { min-width: 0 !important; overflow: hidden !important; }
        header.detailHeader .detailBrand strong { display: block !important; font-size: clamp(9px, 2.65vw, 12px) !important; line-height: 1.15 !important; letter-spacing: .07em !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
        header.detailHeader .detailBrand small { display: block !important; font-size: 7px !important; line-height: 1.2 !important; letter-spacing: .16em !important; margin-top: 3px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
        header.detailHeader .navLinks { display: none !important; }
        header.detailHeader .detailMenu { display: grid !important; flex: 0 0 42px !important; width: 42px !important; height: 42px !important; margin-left: 7px !important; color: #fff !important; background: var(--accent-2, #4da6ff) !important; border: 1px solid var(--accent-1, #7cc7ff) !important; border-radius: 50% !important; place-items: center !important; }
        header.detailHeader .detailMenu svg { color: #fff !important; stroke: #fff !important; }
        .detail-mobile-drawer { background: linear-gradient(135deg, var(--accent-3, #2b9bff) 0%, var(--accent-2, #4da6ff) 100%) !important; color: #fff !important; }
        .detail-mobile-drawer .site-mobile-group-toggle, .detail-mobile-drawer nav > a { color: #fff !important; }
      }
      @media (max-width: 380px) {
        header.detailHeader .detailBrand strong { font-size: 9px !important; letter-spacing: .045em !important; }
        header.detailHeader .detailBrand small { font-size: 6.5px !important; letter-spacing: .11em !important; }
        header.detailHeader .detailBrandLogo { width: 38px !important; height: 38px !important; flex-basis: 38px !important; }
      }
    `; document.head.appendChild(style);
  }

  function buildDetailMobileDrawer() {
    const header = document.querySelector('.detailHeader'); if (!header || document.querySelector('.detailPage .drawer')) return;
    const drawer = document.createElement('div'); drawer.className = 'drawer detail-mobile-drawer'; drawer.hidden = true; drawer.innerHTML = '<div class="drawerTop"><b>Menu</b><button class="close" type="button" aria-label="Close menu">×</button></div><nav></nav>';
    document.querySelector('.detailPage')?.appendChild(drawer); const close = () => { drawer.hidden = true; drawer.classList.remove('open'); }; drawer.querySelector('.close')?.addEventListener('click', close);
    header.querySelector('.detailMenu')?.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); drawer.hidden = false; drawer.classList.add('open'); }, true); buildMobile(drawer);
  }

  function buildDetailDesktopHeader() {
    const header = document.querySelector('.detailHeader'); if (!header) return; installDetailStyles();
    if (!header.querySelector('.navLinks')) { const nav = document.createElement('nav'); nav.className = 'navLinks'; nav.setAttribute('aria-label', 'Main navigation'); const before = header.querySelector('.detailBack') || header.querySelector('.detailMenu'); header.insertBefore(nav, before || null); buildDesktop(nav); }
    buildDetailMobileDrawer();
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
        if (markEl) markEl.hidden = true;
        logoEl.onerror = () => {
          logoEl.hidden = true;
          if (markEl) markEl.hidden = false;
        };
      }
    } catch (_) {
      // Keep the existing placeholder if the public content endpoint is unavailable.
    }
  }

  function enhance() {
    document.querySelectorAll('.navLinks').forEach(buildDesktop);
    buildDetailDesktopHeader();
    buildMobile(document.querySelector('.drawer:not(.detail-mobile-drawer)'));
    hydrateTermsBrand();
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav-group')) document.querySelectorAll('.site-nav-group.open').forEach((group) => { group.classList.remove('open'); group.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false'); });
  });

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
