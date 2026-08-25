(() => {
  const sync = () => {
    document.querySelectorAll('.hero.carousel .carousel-slide').forEach((slide) => {
      const media = slide.querySelector('.carousel-media');
      if (!media) return;
      const src = media.currentSrc || media.src || media.getAttribute('src');
      if (src) slide.style.setProperty('--hero-slide-image', `url("${src.replace(/"/g, '\\"')}")`);
    });
  };

  const observer = new MutationObserver(sync);
  const start = () => {
    sync();
    const hero = document.querySelector('.hero.carousel');
    if (hero) observer.observe(hero, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
