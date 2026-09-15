(() => {
  const boot = async () => {
    if (/\/admin(?:\/|$)/i.test(window.location.pathname)) return;
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') return;
    const oldHeader = document.querySelector('body > header, body > .page > header');
    if (!oldHeader) return;

    document.body.classList.add('page', 'entered', 'unified-static-page');
    document.querySelectorAll('.menu-bar, .site-menu, #siteMenu').forEach((node) => node.remove());

    const header = document.createElement('header');
    header.innerHTML = `
      <button class="brand" type="button" aria-label="Church home">
        <span class="mark">✧</span>
        <span><b id="staticChurchName">Church</b><small id="staticChurchTagline"></small></span>
      </button>
      <button class="icon mobile-menu-trigger" type="button" aria-label="Open menu"><span aria-hidden="true">☰</span></button>
      <nav class="navLinks" aria-label="Main navigation">
        <div class="navActions">
          <button class="icon menuIcon" type="button" aria-label="Open menu">☰</button>
          <button class="icon header-search" type="button" aria-label="Search">⌕</button>
        </div>
      </nav>`;
    oldHeader.replaceWith(header);

    const drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.innerHTML = '<div class="drawerTop"><b>Menu</b><button class="close" type="button" aria-label="Close menu">×</button></div><nav aria-label="Mobile navigation"></nav>';
    document.body.appendChild(drawer);

    const close = () => { drawer.hidden = true; drawer.classList.remove('open'); document.body.style.overflow = ''; };
    const open = () => { drawer.hidden = false; drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
    close();
    header.querySelector('.mobile-menu-trigger')?.addEventListener('click', open);
    header.querySelector('.menuIcon')?.addEventListener('click', open);
    drawer.querySelector('.close')?.addEventListener('click', close);
    drawer.addEventListener('click', (event) => { if (event.target === drawer) close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });

    const home = () => { window.location.href = '/?entered=1#home'; };
    header.querySelector('.brand')?.addEventListener('click', home);
    header.querySelector('.header-search')?.addEventListener('click', home);

    try {
      const response = await fetch('/api/site/content', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const site = await response.json();
      const name = String(site.name || site.churchName || 'Church').trim();
      const tagline = String(site.tagline || '').trim();
      const nameEl = document.getElementById('staticChurchName');
      const taglineEl = document.getElementById('staticChurchTagline');
      if (nameEl) nameEl.textContent = name;
      if (taglineEl) taglineEl.textContent = tagline;
      const logo = site.logo || site.churchLogo || site.logoUrl;
      if (logo) {
        const image = document.createElement('img');
        image.className = 'brandLogo';
        image.alt = '';
        image.src = typeof logo === 'string' ? logo : (logo.url || logo.src || logo.publicUrl || '');
        image.onerror = () => image.remove();
        header.querySelector('.brand')?.prepend(image);
      }
    } catch (_) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();