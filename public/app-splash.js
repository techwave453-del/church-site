(() => {
  const splash = document.getElementById('kfcc-app-splash');
  if (!splash) return;

  const hideSplash = () => {
    splash.classList.add('is-hidden');
    window.setTimeout(() => splash.remove(), 550);
  };

  // Keep the opening brief enough to feel native without delaying the site.
  window.addEventListener('load', () => {
    window.setTimeout(hideSplash, 450);
  }, { once: true });

  // Safety fallback in case another script delays the load event.
  window.setTimeout(hideSplash, 3500);
})();