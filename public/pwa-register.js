(() => {
  if (!('serviceWorker' in navigator)) return;

  let deferredPrompt = null;

  const createInstallButton = () => {
    if (document.getElementById('pwa-install-button')) return;

    const button = document.createElement('button');
    button.id = 'pwa-install-button';
    button.type = 'button';
    button.textContent = 'Install App';
    button.setAttribute('aria-label', 'Install Kingdom Fellowship Christian Church app');
    button.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:9998',
      'border:0', 'border-radius:999px', 'padding:12px 18px',
      'font:600 14px system-ui,sans-serif', 'color:#fff',
      'background:#173b67', 'box-shadow:0 4px 14px rgba(0,0,0,.22)',
      'cursor:pointer', 'display:none'
    ].join(';');

    button.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      deferredPrompt = null;
      button.remove();
      console.info('PWA install choice:', result.outcome);
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
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => registration.update().catch(() => {}))
      .catch((error) => console.warn('PWA service worker registration failed:', error));
  });
})();
