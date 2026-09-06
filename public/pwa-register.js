(() => {
  if (!('serviceWorker' in navigator)) return;

  let deferredPrompt = null;
  let refreshing = false;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const showToast = (message, actionText, action) => {
    let toast = document.getElementById('pwa-status-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pwa-status-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:10000;max-width:calc(100vw - 32px);padding:12px 16px;border-radius:14px;background:#173b67;color:#fff;font:500 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22);display:flex;gap:12px;align-items:center';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '';
    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);
    if (actionText) {
      const button = document.createElement('button');
      button.textContent = actionText;
      button.style.cssText = 'border:0;border-radius:999px;padding:7px 12px;font-weight:700;color:#173b67;background:#fff;cursor:pointer';
      button.onclick = action;
      toast.appendChild(button);
    } else {
      setTimeout(() => toast?.remove(), 3500);
    }
  };

  const createInstallButton = () => {
    if (document.getElementById('pwa-install-button') || isStandalone()) return null;
    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.type = 'button';
    button.textContent = 'Install App';
    button.setAttribute('aria-label', 'Install Kingdom Fellowship Christian Church app');
    button.style.cssText = 'position:fixed;right:16px;bottom:76px;z-index:9998;border:0;border-radius:999px;padding:12px 18px;font:600 14px system-ui,sans-serif;color:#fff;background:#173b67;box-shadow:0 4px 14px rgba(0,0,0,.22);cursor:pointer;display:none';

    button.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      button.remove();
    });

    document.body.appendChild(button);
    return button;
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    const button = createInstallButton();
    if (button) button.style.display = 'block';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.getElementById('pwa-install-button')?.remove();
    showToast('Church app installed successfully');
  });

  window.addEventListener('online', () => showToast('You are back online'));
  window.addEventListener('offline', () => showToast('You are offline. Cached pages may still work.'));

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('A new version is available', 'Update', () => {
              worker.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      registration.update().catch(() => {});
    } catch (error) {
      console.warn('PWA service worker registration failed:', error);
    }
  });
})();