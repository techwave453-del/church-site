(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;

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
    } else setTimeout(() => toast?.remove(), 3500);
  };

  window.addEventListener('appinstalled', () => {
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
            showToast('A new version is available', 'Update', () => worker.postMessage({ type: 'SKIP_WAITING' }));
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) { refreshing = true; window.location.reload(); }
      });
      registration.update().catch(() => {});
    } catch (error) {
      console.warn('PWA service worker registration failed:', error);
    }
  });
})();
