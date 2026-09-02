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
    return { r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16) };
  }

  function mix(hex, target, amount) {
    const a = hexToRgb(hex); const b = hexToRgb(target); const p = Math.max(0, Math.min(1, amount));
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
    if (!style) { style = document.createElement('style'); style.id = styleId; document.head.appendChild(style); }

    style.textContent = `
      :root[data-site-theme="light"] body,:root[data-site-theme="light"] #root,:root[data-site-theme="light"] .page{background:#fff;color:#111}
      :root[data-site-theme="light"] .homeContent,:root[data-site-theme="light"] .homeSection{background:#fff;color:#111}
      :root[data-site-theme="light"] .servicesSection{background:linear-gradient(180deg,var(--accent-1) 0%,#f4f7fa 100%)!important}
      :root[data-site-theme="light"] .linksSection{background:#fff!important}
      :root[data-site-theme="light"] .homeSection p,:root[data-site-theme="light"] .homeSection small{color:#4b5563}
      :root[data-site-theme="light"] .sectionIntro h2,:root[data-site-theme="light"] .siteFooter,:root[data-site-theme="light"] .siteFooter strong{color:#111}
      :root[data-site-theme="light"] .siteFooter{background:#fff;border-top-color:#e5e7eb}
      :root[data-site-theme="light"] header{background:rgba(255,255,255,.96);color:#111}
      :root[data-site-theme="light"] .navLinks a,:root[data-site-theme="light"] .icon{color:#111}
      :root[data-site-theme="dark"] body,:root[data-site-theme="dark"] #root,:root[data-site-theme="dark"] .page{background:#0b0f14;color:#f8fafc}
      :root[data-site-theme="dark"] .homeContent,:root[data-site-theme="dark"] .homeSection{background:#0b0f14;color:#f8fafc;border-color:rgba(255,255,255,.09)}
      :root[data-site-theme="dark"] .servicesSection{background:linear-gradient(180deg,rgba(77,166,255,.28) 0%,#0b0f14 100%)!important}
      :root[data-site-theme="dark"] .linksSection{background:#0b0f14!important}
      :root[data-site-theme="dark"] .homeSection p,:root[data-site-theme="dark"] .homeSection small{color:#cbd5e1}
      :root[data-site-theme="dark"] .sectionIntro h2,:root[data-site-theme="dark"] .siteFooter,:root[data-site-theme="dark"] .siteFooter strong{color:#f8fafc}
      :root[data-site-theme="dark"] .siteFooter{background:#070a0f;border-top-color:rgba(255,255,255,.1)}
      :root[data-site-theme="dark"] header{background:rgba(10,14,20,.96);color:#f8fafc;border-bottom-color:var(--accent-2)}
      :root[data-site-theme="dark"] .navLinks a,:root[data-site-theme="dark"] .icon,:root[data-site-theme="dark"] .brand b{color:#f8fafc}
      :root[data-site-theme="dark"] .brand small{color:var(--accent-1)}
      :root[data-site-theme="dark"] .navLinks a:hover{background:rgba(255,255,255,.08)}
      :root[data-site-theme="dark"] .classTile,:root[data-site-theme="dark"] .imageTile{border-color:rgba(255,255,255,.12)}
      :root[data-site-theme="dark"] .drawer{background:linear-gradient(135deg,#07111f,var(--accent-3) 55%,var(--accent-2))}
      .detailLink,.classTile button,.enter{background:var(--accent-2)!important;border-color:var(--accent-2)!important}
      .detailLink,.classTile button,.enter,.page .chat{box-shadow:0 12px 32px var(--accent-shadow)!important}
      .sectionIntro>span,.tileMore,.siteFooter a,.homeSection a{color:var(--accent-2)}
      .sectionIntro i{background:var(--accent-2)}.page .chat{background:var(--accent-2)!important}.language .active{background:var(--accent-2)!important}header{border-bottom-color:var(--accent-2)!important}
      :root[data-site-theme="light"] .church-chat-panel{background:#fff!important;color:#111!important;border-color:rgba(17,17,17,.08)!important}
      :root[data-site-theme="light"] .church-chat-header{background:linear-gradient(135deg,var(--accent-3),var(--accent-2))!important}
      :root[data-site-theme="light"] .church-chat-messages{background:#f7faff!important}
      :root[data-site-theme="light"] .church-chat-message{background:#fff!important;color:#111!important;border-color:rgba(77,166,255,.12)!important}
      :root[data-site-theme="light"] .church-chat-message.mine{background:var(--accent-1)!important}
      :root[data-site-theme="light"] .church-chat-message.bot{border-color:rgba(77,166,255,.18)!important}
      :root[data-site-theme="light"] .church-chat-suggestions,:root[data-site-theme="light"] .church-chat-form{background:#fff!important;border-color:rgba(77,166,255,.14)!important}
      :root[data-site-theme="light"] .church-chat-suggestion{background:#f7faff!important;color:#173f35!important;border-color:var(--accent-1)!important}
      :root[data-site-theme="light"] .church-chat-send{background:var(--accent-2)!important}
      :root[data-site-theme="light"] .church-chat-name,:root[data-site-theme="light"] .church-chat-input{background:#fff!important;color:#111!important;border-color:rgba(77,166,255,.22)!important}
      :root[data-site-theme="dark"] .church-chat-panel{background:#0f1720!important;color:#f8fafc!important;border-color:rgba(255,255,255,.12)!important;box-shadow:0 18px 60px rgba(0,0,0,.5)!important}
      :root[data-site-theme="dark"] .church-chat-header{background:linear-gradient(135deg,var(--accent-3),var(--accent-2))!important}
      :root[data-site-theme="dark"] .church-chat-messages{background:#0b1118!important}
      :root[data-site-theme="dark"] .church-chat-message,:root[data-site-theme="dark"] .church-chat-message.bot{background:#17212c!important;color:#f8fafc!important;border-color:rgba(255,255,255,.1)!important}
      :root[data-site-theme="dark"] .church-chat-message.mine{background:var(--accent-3)!important}
      :root[data-site-theme="dark"] .church-chat-message .body{color:#f8fafc!important}
      :root[data-site-theme="dark"] .church-chat-suggestions,:root[data-site-theme="dark"] .church-chat-form{background:#0f1720!important;border-color:rgba(255,255,255,.1)!important}
      :root[data-site-theme="dark"] .church-chat-suggestion{background:#162331!important;color:#dbeafe!important;border-color:rgba(255,255,255,.16)!important}
      :root[data-site-theme="dark"] .church-chat-name,:root[data-site-theme="dark"] .church-chat-input{background:#111c27!important;color:#f8fafc!important;border-color:rgba(255,255,255,.16)!important}
      :root[data-site-theme="dark"] .church-chat-name::placeholder,:root[data-site-theme="dark"] .church-chat-input::placeholder{color:#94a3b8!important}
      :root[data-site-theme="dark"] .church-chat-send{background:var(--accent-2)!important}
      :root[data-site-theme="dark"] .church-chat-note,:root[data-site-theme="dark"] .church-chat-empty{color:#aebdca!important}

      /* Standalone Terms/Privacy headers: same geometry as homepage. */
      .termsHeader{position:sticky!important;top:0!important;z-index:200!important;width:100vw!important;height:166px!important;min-height:166px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:112px 54px!important;padding:0!important;background:linear-gradient(100deg,var(--church-navy,#061a2b) 0%,#0b2437 25%,var(--accent-3,#9b6030) 62%,var(--accent-2,#4da6ff) 100%)!important;box-shadow:0 8px 28px rgba(0,0,0,.18)!important}
      .termsHeader .termsBrand{grid-row:1!important;height:112px!important;width:100%!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;padding:0 28px 0 0!important;gap:14px!important;text-align:left!important}
      .termsHeader .termsBrandLogo,.termsHeader .termsBrandMark{width:auto!important;height:112px!important;max-width:112px!important;max-height:112px!important;flex:0 0 auto!important;object-fit:contain!important;border-radius:0!important}
      .termsHeader .termsBrand strong{color:#fff!important;font-family:Fraunces,Georgia,serif!important;font-size:clamp(17px,1.45vw,25px)!important;line-height:1.08!important;letter-spacing:.095em!important;white-space:nowrap!important}
      .termsHeader .termsBrand small{color:var(--accent-1,#e6c18f)!important;font-family:"Plus Jakarta Sans",system-ui,sans-serif!important;font-size:9px!important;line-height:1!important;letter-spacing:.34em!important;margin-top:8px!important;white-space:nowrap!important}
      .termsHeader .termsNav{grid-row:2!important;width:100%!important;height:54px!important;padding:0 28px!important;display:flex!important;align-items:center!important;background:rgba(0,0,0,.12)!important}
      .termsHeader .termsNav .navLinks{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:54px!important;gap:clamp(8px,1.15vw,20px)!important}
      @media(max-width:1150px) and (min-width:701px){.termsHeader .termsBrand{padding-right:18px!important;gap:11px!important}.termsHeader .termsBrandLogo,.termsHeader .termsBrandMark{max-width:96px!important;height:112px!important}.termsHeader .termsBrand strong{font-size:17px!important}.termsHeader .termsBrand small{font-size:7px!important}}
      @media(max-width:700px){
        .termsHeader{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100vw!important;height:76px!important;min-height:76px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 10px!important}
        .termsHeader .termsBrand{height:76px!important;min-width:0!important;width:auto!important;max-width:calc(100% - 58px)!important;flex:1 1 auto!important;padding:6px 4px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;text-align:left!important;overflow:hidden!important}
        .termsHeader .termsBrandLogo,.termsHeader .termsBrandMark{width:50px!important;height:62px!important;max-width:50px!important;max-height:62px!important;flex:0 0 50px!important}
        .termsHeader .termsBrand strong{font-size:clamp(10px,3.1vw,14px)!important;line-height:1.12!important;letter-spacing:.055em!important;white-space:normal!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}
        .termsHeader .termsBrand small{font-size:6.5px!important;letter-spacing:.16em!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
        .termsHeader .termsNav{display:none!important}.termsHeader .termsMobile{display:block!important;position:absolute!important;right:10px!important;top:16px!important}.termsHeader .termsMobile button{width:44px!important;height:44px!important;border-radius:50%!important;background:var(--accent-2,#4da6ff)!important;color:#fff!important;border:1px solid rgba(255,255,255,.34)!important}
      }
      @media(max-width:380px){.termsHeader .termsBrandLogo,.termsHeader .termsBrandMark{width:43px!important;height:58px!important;flex-basis:43px!important}.termsHeader .termsBrand{gap:7px!important;padding-left:2px!important}.termsHeader .termsBrand strong{font-size:9.5px!important;letter-spacing:.04em!important}.termsHeader .termsBrand small{font-size:6px!important;letter-spacing:.12em!important}}
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
      try { const cached = JSON.parse(localStorage.getItem('church-site-theme') || '{}'); applyTheme(cached); }
      catch (_) { applyTheme({}); }
    }
  }

  window.applyChurchSiteTheme = applyTheme;
  loadTheme();
  window.addEventListener('storage', event => {
    if (event.key !== 'church-site-theme') return;
    try { applyTheme(JSON.parse(event.newValue || '{}')); } catch (_) {}
  });
})();
