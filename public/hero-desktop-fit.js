(()=>{
  const setup=()=>{
    if(!window.matchMedia('(min-width:701px)').matches)return;
    document.querySelectorAll('.hero.carousel .carousel-slide').forEach(slide=>{
      const media=slide.querySelector('.carousel-media');
      if(!media)return;
      const source=media.currentSrc||media.src;
      if(source)slide.style.setProperty('--hero-image',`url("${source.replace(/"/g,'\\"')}")`);
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
