(() => {
  'use strict';
  if (window.__PublicPwaInstallLoaded) return;
  window.__PublicPwaInstallLoaded = true;

  let deferredPrompt = null;
  let installed = false;
  let dismissedUntil = 0;

  const isEntered = () => new URLSearchParams(window.location.search).get('entered') === '1' || document.body?.classList.contains('entered');
  const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function addStyles() {
    if (document.getElementById('public-pwa-install-style')) return;
    const style = document.createElement('style');
    style.id = 'public-pwa-install-style';
    style.textContent = `
      .site-pwa-install-wrap{margin-left:auto;display:flex;align-items:center;position:relative;z-index:4}
      .site-pwa-install{width:38px;height:38px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:transform .25s ease,opacity .25s ease,background .25s ease;opacity:.82}
      .site-pwa-install svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .site-pwa-install:hover,.site-pwa-install:focus-visible{opacity:1;transform:translateY(-1px);background:#ffffff1a;outline:none}
      .site-pwa-install.pulse{animation:sitePwaPulse 1.9s ease-in-out 2}
      @keyframes sitePwaPulse{0%,100%{transform:scale(1)}35%{transform:scale(1.13)}65%{transform:scale(1)}}
      .site-pwa-install[hidden]{display:none}
      .site-pwa-dialog{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:#06152699;backdrop-filter:blur(5px)}
      .site-pwa-dialog[hidden]{display:none}
      .site-pwa-card{width:min(430px,100%);background:#fff;color:#15263a;border-radius:18px;padding:26px;box-shadow:0 24px 70px #0005}
      .site-pwa-card h2{margin:0 0 8px;font-size:22px}.site-pwa-card p{margin:0 0 18px;line-height:1.55;color:#526174}
      .site-pwa-steps{display:grid;gap:10px;margin:0 0 20px}.site-pwa-step{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border-radius:11px;background:#f4f7fa;font-size:14px}.site-pwa-step b{display:block;margin-bottom:2px}.site-pwa-step span{font-size:12px;color:#66758a}
      .site-pwa-actions{display:flex;gap:10px;justify-content:flex-end}.site-pwa-actions button{border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer}.site-pwa-cancel{background:#edf1f5;color:#34445a}.site-pwa-confirm{background:#173b67;color:#fff}.site-pwa-confirm:disabled{opacity:.5;cursor:not-allowed}
      @media(max-width:700px){.site-pwa-install-wrap{margin-left:4px}.site-pwa-install{width:34px;height:34px}.site-pwa-install svg{width:16px;height:16px}.site-pwa-card{padding:22px}}
      @media(prefers-reduced-motion:reduce){.site-pwa-install{transition:none}.site-pwa-install.pulse{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function createDialog() {
    if (document.getElementById('sitePwaDialog')) return document.getElementById('sitePwaDialog');
    const dialog = document.createElement('div');
    dialog.id = 'sitePwaDialog'; dialog.className = 'site-pwa-dialog'; dialog.hidden = true;
    dialog.innerHTML = `<section class="site-pwa-card" role="dialog" aria-modal="true" aria-labelledby="sitePwaTitle"><h2 id="sitePwaTitle">Install the church app</h2><p>Get faster access to the church website, live services, media and church information.</p><div class="site-pwa-steps"><div class="site-pwa-step"><strong>✓</strong><div><b>Browser verified</b><span>This browser supports app installation.</span></div></div><div class="site-pwa-step"><strong>✓</strong><div><b>Website verified</b><span>You are in the entered website experience.</span></div></div><div class="site-pwa-step"><strong>3</strong><div><b>Install</b><span>Your browser will show its secure installation prompt.</span></div></div></div><div class="site-pwa-actions"><button type="button" class="site-pwa-cancel">Not now</button><button type="button" class="site-pwa-confirm">Continue</button></div></section>`;
    document.body.appendChild(dialog);
    const close = () => { dialog.hidden = true; dismissedUntil = Date.now() + 30 * 60 * 1000; };
    dialog.querySelector('.site-pwa-cancel').addEventListener('click', close);
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
    dialog.querySelector('.site-pwa-confirm').addEventListener('click', async () => {
      if (!deferredPrompt) { close(); return; }
      const prompt = deferredPrompt; deferredPrompt = null;
      try { await prompt.prompt(); await prompt.userChoice; } catch (_) {}
      close(); updateVisibility();
    });
    return dialog;
  }

  function findNav() {
    return document.querySelector('.navLinks:not([data-pwa-ready]), nav.site-nav:not([data-pwa-ready]), .site-nav:not([data-pwa-ready])');
  }

  function installIndicator() {
    if (!isEntered() || installed || !deferredPrompt) return;
    const nav = findNav();
    if (!nav) return;
    nav.dataset.pwaReady = 'true';
    addStyles(); createDialog();
    const wrap = document.createElement('div'); wrap.className = 'site-pwa-install-wrap';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'site-pwa-install'; button.setAttribute('aria-label','Install church app'); button.title='Install church app';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"/><path d="M5 19v1h14v-1"/></svg>';
    button.addEventListener('click', () => { const dialog = document.getElementById('sitePwaDialog'); if (dialog) dialog.hidden = false; });
    wrap.appendChild(button); nav.appendChild(wrap);
    setTimeout(() => { if (!installed && deferredPrompt && isEntered()) button.classList.add('pulse'); }, 8000);
  }

  function updateVisibility() {
    if (isStandalone()) installed = true;
    document.querySelectorAll('.site-pwa-install-wrap').forEach(el => { el.hidden = installed || !deferredPrompt || !isEntered(); });
    if (!installed) installIndicator();
  }

  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; updateVisibility(); });
  window.addEventListener('appinstalled', () => { installed = true; deferredPrompt = null; updateVisibility(); });
  window.addEventListener('pageshow', updateVisibility);
  window.addEventListener('popstate', updateVisibility);
  setTimeout(() => { if (!isStandalone()) updateVisibility(); }, 1200);
  setInterval(() => { if (Date.now() >= dismissedUntil) updateVisibility(); }, 60000);
})();
