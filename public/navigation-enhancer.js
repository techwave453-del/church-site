(() => {
  'use strict';

  const fallbackGroups = [
    { label: 'About', items: [{ label: 'About the Church', href: '#detail/about' }, { label: 'Visit Us', href: '#detail/visit-us' }] },
    { label: 'Ministries', items: [{ label: 'All Ministries', href: '/ministries.html' }, { label: 'Service Times', target: 'events' }, { label: 'Membership Classes', target: 'resources' }] },
    { label: 'Sermons', direct: true, href: '#detail/sermons' },
    { label: 'Events', items: [{ label: 'Church Events', href: '/events.html' }, { label: 'Visit Us', href: '#detail/visit-us' }] },
    { label: 'Media', items: [{ label: 'Media & Church Resources', href: '#detail/media' }] },
    { label: 'Give', direct: true, href: '#detail/give' },
    { label: 'Contact', direct: true, href: '#detail/contact' },
    { label: 'More', items: [{ label: 'Terms & Conditions', href: '/terms.html' }] }
  ];

  let groups = fallbackGroups;

  const isTermsPage = () => /(^|\/)terms\.html$/i.test(window.location.pathname);

  const safeHref = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (raw.startsWith('/') || raw.startsWith('#')) return raw;
    try {
      const url = new URL(raw, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) {
      return '';
    }
  };

  function normalizeNavigation(items) {
    if (!Array.isArray(items) || !items.length) return [];
    const visible = items
      .filter(item => item && item.is_visible !== false)
      .map((item, index) => ({
        ...item,
        id: item.id ?? `cms-${index}`,
        parent_id: item.parent_id == null ? null : item.parent_id,
        position: Number(item.position) || 0,
        label: String(item.label || '').trim(),
        href: safeHref(item.href) || '/'
      }))
      .filter(item => item.label && item.href);

    const roots = visible.filter(item => item.parent_id == null).sort((a, b) => a.position - b.position);
    return roots.map(root => {
      const children = visible
        .filter(item => String(item.parent_id) === String(root.id))
        .sort((a, b) => a.position - b.position);
      return children.length
        ? { label: root.label, items: children.map(item => ({ label: item.label, href: item.href })) }
        : { label: root.label, direct: true, href: root.href };
    });
  }

  async function loadNavigation() {
    try {
      const response = await fetch('/api/cms/navigation', {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Navigation request failed (${response.status})`);
      const payload = await response.json();
      const cmsGroups = normalizeNavigation(payload);
      if (cmsGroups.length) groups = cmsGroups;
    } catch (error) {
      groups = fallbackGroups;
      console.warn('CMS navigation unavailable; using fallback navigation.', error.message);
    }
  }

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
    const href = safeHref(item.href || (item.target ? `#${item.target}` : '/')) || '/';
    a.href = href;
    a.textContent = item.label;

    if (item.target) {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu?.();
        scrollTo(item.target);
      });
    } else if (href === '/' || href === '#home') {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu?.();
        scrollTo('home');
      });
    } else if (href.startsWith('#detail/')) {
      a.addEventListener('click', (event) => {
        event.preventDefault();
        closeMenu?.();
        scrollTo(href.slice('#detail/'.length));
      });
    } else if (href.startsWith('#')) {
      a.addEventListener('click', (event) => {
        const target = href.slice(1);
        const el = document.getElementById(target);
        if (el) {
          event.preventDefault();
          closeMenu?.();
          scrollTo(target);
        }
      });
    } else if (['/terms.html', '/ministries.html', '/events.html'].includes(href)) {
      a.addEventListener('click', () => closeMenu?.());
    }
    return a;
  };

  const createWatchLive = (closeMenu) => {
    const a = document.createElement('a');
    a.className = 'site-watch-live';
    a.href = '/live_service.html';
    a.innerHTML = '<span aria-hidden="true">▶</span><b>WATCH LIVE</b>';
    if (closeMenu) a.addEventListener('click', closeMenu);
    return a;
  };

  function buildDesktop(nav) {
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true';
    nav.innerHTML = '';

    const homeGroup = groups.find(group => String(group.label).trim().toLowerCase() === 'home');
    if (homeGroup) nav.appendChild(createLink({ label: homeGroup.label, href: homeGroup.href || '/' }));
    else nav.appendChild(createLink({ label: 'Home', href: '/' }));

    groups.filter(group => String(group.label).trim().toLowerCase() !== 'home').forEach((group) => {
      if (group.direct) {
        nav.appendChild(createLink(group));
        return;
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'site-nav-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-nav-group-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div');
      submenu.className = 'site-nav-submenu';
      (group.items || []).forEach(item => submenu.appendChild(createLink(item)));
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        document.querySelectorAll('.site-nav-group.open').forEach(other => {
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

    if (!groups.some(group => String(group.label).trim().toLowerCase() === 'watch live')) {
      nav.appendChild(createWatchLive());
    }
  }

  function buildMobile(drawer) {
    if (!drawer) return;
    const nav = drawer.querySelector('nav');
    if (!nav || nav.dataset.groupedNavigation === 'true') return;
    nav.dataset.groupedNavigation = 'true';
    nav.innerHTML = '';
    const closeMenu = () => drawer.querySelector('.close')?.click();

    const homeGroup = groups.find(group => String(group.label).trim().toLowerCase() === 'home');
    nav.appendChild(createLink(homeGroup || { label: 'Home', href: '/' }, closeMenu));

    groups.filter(group => String(group.label).trim().toLowerCase() !== 'home').forEach(group => {
      if (group.direct) {
        nav.appendChild(createLink(group, closeMenu));
        return;
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'site-mobile-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-mobile-group-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `${group.label}<span aria-hidden="true">+</span>`;
      const submenu = document.createElement('div');
      submenu.className = 'site-mobile-submenu';
      (group.items || []).forEach(item => submenu.appendChild(createLink(item, closeMenu)));
      button.addEventListener('click', () => {
        const open = wrapper.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
        button.querySelector('span').textContent = open ? '−' : '+';
      });
      wrapper.append(button, submenu);
      nav.appendChild(wrapper);
    });

    if (!groups.some(group => String(group.label).trim().toLowerCase() === 'watch live')) {
      nav.appendChild(createWatchLive(closeMenu));
    }
  }

  function resolveLogo(value, depth = 0) {
    if (depth > 6 || value == null) return '';
    if (Array.isArray(value)) {
      for (const item of value) { const found = resolveLogo(item, depth + 1); if (found) return found; }
      return '';
    }
    if (typeof value === 'object') {
      for (const key of ['url','src','publicUrl','public_url','logoUrl','logo_url','fileUrl','file_url','href','path','logo','image','value']) {
        const found = resolveLogo(value[key], depth + 1);
        if (found) return found;
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
      document.querySelectorAll('.site-nav-group.open').forEach(group => {
        group.classList.remove('open');
        group.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  const initialize = async () => {
    await loadNavigation();
    enhance();
    requestAnimationFrame(() => enhance());
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
