(() => {
  const DEFAULT_ACCENT = '#4da6ff';
  const DEFAULT_MODE = 'light';
  const styleId = 'site-theme-runtime';

  function normalizeHex(value) {
    const v = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(v) ? v : DEFAULT_ACCENT;
  }

  function hexToRgb(hex) {
    const v = normalizeHex(hex).slice(1);
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16)
    };
  }

  function mix(hex, target, amount) {
    const a = hexToRgb(hex);
    const b = hexToRgb(target);
    const p = Math.max(0, Math.min(1, amount));
    return '#' + [a.r, a.g, a.b].map((n, i) => Math.round(n + (b[['r','g','b'][i]] - n) * p).toString(16).padStart(2, '0')).join('');
  }

  function applyTheme(theme) {
    const mode = theme?.mode === 'dark' ? 'dark' : DEFAULT_MODE;
    const accent = normalizeHex(theme?.accent);
    const accentLight = mix(accent, '#ffffff', 0.62);
    const accentDark = mix(accent, '#000000', 0.28);
    const root = document.documentElement;

    root.dataset.siteTheme = mode;
    root.style.setProperty('--accent-1', accentLight);
    root.style.setProperty('--accent-2', accent);
    root.style.setProperty('--accent-3', accentDark);
    root.style.setProperty('--accent-shadow', `${accent}66`);
    root.style.colorScheme = mode;

    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      :root[data-site-theme="light"] body,
      :root[data-site-theme="light"] #root,
      :root[data-site-theme="light"] .page { background:#fff; color:#111; }
      :root[data-site-theme="light"] .homeContent { background:#fff; color:#111; }
      :root[data-site-theme="light"] .homeSection { background:#fff; color:#111; }
      :root[data-site-theme="light"] .homeSection p,
      :root[data-site-theme="light"] .homeSection small { color:#4b5563; }
      :root[data-site-theme="light"] .sectionIntro h2,
      :root[data-site-theme="light"] .siteFooter,
      :root[data-site-theme="light"] .siteFooter strong { color:#111; }
      :root[data-site-theme="light"] .siteFooter { background:#fff; border-top-color:#e5e7eb; }
      :root[data-site-theme="light"] header { background:rgba(255,255,255,.96); color:#111; }
      :root[data-site-theme="light"] .navLinks a,
      :root[data-site-theme="light"] .icon { color:#111; }

      :root[data-site-theme="dark"] body,
      :root[data-site-theme="dark"] #root,
      :root[data-site-theme="dark"] .page { background:#0b0f14; color:#f8fafc; }
      :root[data-site-theme="dark"] .homeContent { background:#0b0f14; color:#f8fafc; }
      :root[data-site-theme="dark"] .homeSection { background:#0b0f14; color:#f8fafc; border-color:rgba(255,255,255,.09); }
      :root[data-site-theme="dark"] .homeSection p,
      :root[data-site-theme="dark"] .homeSection small { color:#cbd5e1; }
      :root[data-site-theme="dark"] .sectionIntro h2,
      :root[data-site-theme="dark"] .siteFooter,
      :root[data-site-theme="dark"] .siteFooter strong { color:#f8fafc; }
      :root[data-site-theme="dark"] .siteFooter { background:#070a0f; border-top-color:rgba(255,255,255,.1); }
      :root[data-site-theme="dark"] header { background:rgba(10,14,20,.96); color:#f8fafc; border-bottom-color:var(--accent-2); }
      :root[data-site-theme="dark"] .navLinks a,
      :root[data-site-theme="dark"] .icon,
      :root[data-site-theme="dark"] .brand b { color:#f8fafc; }
      :root[data-site-theme="dark"] .brand small { color:var(--accent-1); }
      :root[data-site-theme="dark"] .navLinks a:hover { background:rgba(255,255,255,.08); }
      :root[data-site-theme="dark"] .classTile,
      :root[data-site-theme="dark"] .imageTile { border-color:rgba(255,255,255,.12); }
      :root[data-site-theme="dark"] .drawer { background:linear-gradient(135deg,#07111f,var(--accent-3) 55%,var(--accent-2)); }

      .detailLink,
      .classTile button,
      .enter { background:var(--accent-2) !important; border-color:var(--accent-2) !important; }
      .detailLink,
      .classTile button,
      .enter,
      .chat { box-shadow:0 12px 32px var(--accent-shadow) !important; }
      .sectionIntro > span,
      .tileMore,
      .siteFooter a,
      .homeSection a { color:var(--accent-2); }
      .sectionIntro i { background:var(--accent-2); }
      .chat { background:var(--accent-2) !important; }
      .language .active { background:var(--accent-2) !important; }
      header { border-bottom-color:var(--accent-2) !important; }
    `;
  }

  async function loadTheme() {
    try {
      const response = await fetch('/api/site/content', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('theme request failed');
      const content = await response.json();
      applyTheme(content?.theme || {});
      try { localStorage.setItem('church-site-theme', JSON.stringify(content?.theme || {})); } catch (_) {}
    } catch (_) {
      try {
        const cached = JSON.parse(localStorage.getItem('church-site-theme') || '{}');
        applyTheme(cached);
      } catch (_) {
        applyTheme({});
      }
    }
  }

  window.applyChurchSiteTheme = applyTheme;
  loadTheme();
  window.addEventListener('storage', event => {
    if (event.key !== 'church-site-theme') return;
    try { applyTheme(JSON.parse(event.newValue || '{}')); } catch (_) {}
  });
})();
