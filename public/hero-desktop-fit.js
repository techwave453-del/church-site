(()=>{
  const setup=()=>{
    if(!window.matchMedia('(min-width:701px)').matches)return;
    const root=document.querySelector('.hero.carousel .carousel-inner');
    if(!root)return;

    const sync=()=>{
      root.querySelectorAll('.carousel-slide').forEach(slide=>{
        const media=slide.querySelector('.carousel-media');
        if(!media)return;
        const source=media.currentSrc||media.src||media.getAttribute('src');
        if(source)slide.style.setProperty('--hero-image',`url("${source.replace(/"/g,'\\"')}")`);
      });
    };

    sync();
    const observer=new MutationObserver(sync);
    observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','src']});
    window.addEventListener('resize',sync,{passive:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
