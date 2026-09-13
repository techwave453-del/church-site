(() => {
  const skeleton = document.getElementById('kfcc-home-skeleton');
  const root = document.getElementById('root');
  if (!skeleton || !root) return;

  let hidden = false;
  const hide = () => {
    if (hidden || !root.children.length) return;
    hidden = true;
    skeleton.classList.add('is-hidden');
    skeleton.setAttribute('aria-busy', 'false');
    window.setTimeout(() => skeleton.remove(), 350);
    observer.disconnect();
  };

  const observer = new MutationObserver(() => {
    if (root.children.length) window.requestAnimationFrame(hide);
  });
  observer.observe(root, { childList: true });

  window.addEventListener('load', () => window.setTimeout(hide, 80), { once: true });
  window.setTimeout(hide, 6000);
  if (root.children.length) hide();
})();