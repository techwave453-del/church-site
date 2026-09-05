(() => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        registration.update().catch(() => {});
      })
      .catch((error) => {
        console.warn('PWA service worker registration failed:', error);
      });
  });
})();
