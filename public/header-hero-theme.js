(() => {
  const isHomeHeader = () => document.querySelector('.page.entered > header');

  const getHeroImage = () => {
    const carousel = document.querySelector('.hero.carousel .carousel-inner');
    if (!carousel) return '';
    const slides = [...carousel.querySelectorAll('.carousel-slide')];
    if (!slides.length) return '';

    const center = window.innerWidth / 2;
    let best = slides[0];
    let bestDistance = Infinity;
    for (const slide of slides) {
      const media = slide.querySelector('.carousel-media');
      if (!media) continue;
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const distance = Math.abs(slideCenter - center);
      if (distance < bestDistance) {
        best = slide;
        bestDistance = distance;
      }
    }

    const media = best.querySelector('.carousel-media');
    return media?.currentSrc || media?.src || '';
  };

  const sync = () => {
    const header = isHomeHeader();
    if (!header) return;
    const source = getHeroImage();
    if (!source) return;
    const safe = source.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    header.style.setProperty('--header-hero-image', `url("${safe}")`);
  };

  const start = () => {
    sync();
    const carousel = document.querySelector('.hero.carousel .carousel-inner');
    if (carousel) {
      carousel.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    }
    window.addEventListener('resize', sync, { passive: true });
    window.setInterval(sync, 900);
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'class', 'style'] });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
