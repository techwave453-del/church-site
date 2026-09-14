(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;
  const VERSION_KEY = 'kfcc-public-build-version';

  const checkDeploymentVersion = async () => {
    try {
      const response = await fetch(`/build-version.json?ts=${Date.now()}`, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data?.version) return;
      const previous = localStorage.getItem(VERSION_KEY);
      localStorage.setItem(VERSION_KEY, data.version);
      if (previous && previous !== data.version && !sessionStorage.getItem('kfcc-auto-updated')) {
        sessionStorage.setItem('kfcc-auto-updated', '1');
        window.location.reload();
      }
    } catch (_) {}
  };

  const showToast = (message) => {
    let toast = document.getElementById('pwa-status-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pwa-status-toast';
      toast.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:10000;max-width:calc(100vw - 32px);padding:12px 16px;border-radius:14px;background:#173b67;color:#fff;font:500 14px system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.22)';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    setTimeout(() => toast?.remove(), 3500);
  };

  window.addEventListener('appinstalled', () => showToast('Church app installed successfully'));
  window.addEventListener('online', () => showToast('You are back online'));
  window.addEventListener('offline', () => showToast('You are offline. Cached pages may still work.'));

  window.addEventListener('load', async () => {
    await checkDeploymentVersion();
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
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
