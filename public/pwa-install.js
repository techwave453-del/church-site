(() => {
  'use strict';
  if (window.__PublicPwaInstallLoaded) return;
  window.__PublicPwaInstallLoaded = true;

  let deferredPrompt = null;
  let installed = false;
  let dismissedUntil = 0;
  let indicatorButton = null;

  const hasEntered = () => {
    try {
      if (sessionStorage.getItem('kfcc-site-entered') === '1') return true;
    } catch (_) {}
    return new URLSearchParams(location.search).get('entered') === '1' || document.body?.classList.contains('entered');
  };
  const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function addStyles() {
    if (document.getElementById('public-pwa-install-style')) return;
    const style = document.createElement('style');
    style.id = 'public-pwa-install-style';
    style.textContent = `
      .site-pwa-install-wrap{margin-left:auto!important;display:flex!important;align-items:center!important;position:relative!important;z-index:30!important;flex:0 0 auto!important}
      .site-pwa-install{width:38px!important;height:38px!important;padding:0!important;border:1px solid currentColor!important;border-radius:50%!important;background:transparent!important;color:inherit!important;display:grid!important;place-items:center!important;cursor:pointer!important;transition:transform .25s ease,opacity .25s ease,background .25s ease!important;opacity:.82!important}
      .site-pwa-install svg{width:18px!important;height:18px!important;stroke:currentColor!important;fill:none!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important}
      .site-pwa-install:hover,.site-pwa-install:focus-visible{opacity:1!important;transform:translateY(-1px)!important;background:#ffffff1a!important;outline:none!important}
      .site-pwa-install.pulse{animation:sitePwaPulse 1.9s ease-in-out 2}
      @keyframes sitePwaPulse{0%,100%{transform:scale(1)}35%{transform:scale(1.13)}65%{transform:scale(1)}}
      .site-pwa-install[hidden],.site-pwa-install-wrap[hidden]{display:none!important}
      .site-pwa-dialog{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:#06152699;backdrop-filter:blur(5px)}
      .site-pwa-dialog[hidden]{display:none}
      .site-pwa-card{width:min(430px,100%);background:#fff;color:#15263a;border-radius:18px;padding:26px;box-shadow:0 24px 70px #0005}
      .site-pwa-card h2{margin:0 0 8px;font-size:22px}.site-pwa-card p{margin:0 0 18px;line-height:1.55;color:#526174}
      .site-pwa-steps{display:grid;gap:10px;margin:0 0 20px}.site-pwa-step{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border-radius:11px;background:#f4f7fa;font-size:14px}.site-pwa-step b{display:block;margin-bottom:2px}.site-pwa-step span{font-size:12px;color:#66758a}
      .site-pwa-actions{display:flex;gap:10px;justify-content:flex-end}.site-pwa-actions button{border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer}.site-pwa-cancel{background:#edf1f5;color:#34445a}.site-pwa-confirm{background:#173b67;color:#fff}
      @media(max-width:700px){.site-pwa-install-wrap{margin-left:4px!important}.site-pwa-install{width:34px!important;height:34px!important}.site-pwa-install svg{width:16px!important;height:16px!important}.site-pwa-card{padding:22px}}
      @media(prefers-reduced-motion:reduce){.site-pwa-install{transition:none!important}.site-pwa-install.pulse{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function createDialog() {
    if (document.getElementById('sitePwaDialog')) return document.getElementById('sitePwaDialog');
    const dialog = document.createElement('div');
    dialog.id = 'sitePwaDialog'; dialog.className = 'site-pwa-dialog'; dialog.hidden = true;
    dialog.innerHTML = `<section class="site-pwa-card" role="dialog" aria-modal="true" aria-labelledby="sitePwaTitle"><h2 id="sitePwaTitle">Install the church app</h2><p>Get faster access to the church website, live services, media and church information.</p><div class="site-pwa-steps"><div class="site-pwa-step"><strong>✓</strong><div><b>Browser verified</b><span>This browser supports app installation.</span></div></div><div class="site-pwa-step"><strong>✓</strong><div><b>Website ready</b><span>The church website is ready to be installed as an app.</span></div></div><div class="site-pwa-step"><strong>3</strong><div><b>Install</b><span>Your browser will show its secure installation prompt.</span></div></div></div><div class="site-pwa-actions"><button type="button" class="site-pwa-cancel">Not now</button><button type="button" class="site-pwa-confirm">Continue</button></div></section>`;
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

  function findHeaderTarget() {
    const header = document.querySelector('header');
    if (!header) return null;
    const nav = header.querySelector('.navLinks');
    if (nav) return nav;
    return header;
  }

  function installIndicator() {
    if (!hasEntered() || installed || !deferredPrompt || Date.now() < dismissedUntil) return;
    if (indicatorButton?.isConnected) return;
    const target = findHeaderTarget();
    if (!target) return;
    addStyles(); createDialog();

    const wrap = document.createElement('div');
    wrap.className = 'site-pwa-install-wrap';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'site-pwa-install';
    button.setAttribute('aria-label','Install church app'); button.title='Install church app';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"/><path d="M5 19v1h14v-1"/></svg>';
    button.addEventListener('click', () => { const dialog = document.getElementById('sitePwaDialog'); if (dialog) dialog.hidden = false; });
    wrap.appendChild(button); target.appendChild(wrap); indicatorButton = button;
    setTimeout(() => { if (!installed && deferredPrompt && hasEntered() && indicatorButton === button) button.classList.add('pulse'); }, 8000);
  }

  function updateVisibility() {
    if (isStandalone()) installed = true;
    document.querySelectorAll('.site-pwa-install-wrap').forEach(el => { el.hidden = installed || !deferredPrompt || !hasEntered(); });
    if (!installed) installIndicator();
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    updateVisibility();
  });
  window.addEventListener('appinstalled', () => { installed = true; deferredPrompt = null; updateVisibility(); });
  window.addEventListener('pageshow', updateVisibility);
  window.addEventListener('popstate', updateVisibility);

  const boot = () => {
    updateVisibility();
    if (!hasEntered()) {
      const poll = setInterval(() => {
        updateVisibility();
        if (hasEntered() || installed) clearInterval(poll);
      }, 500);
      setTimeout(() => clearInterval(poll), 120000);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
