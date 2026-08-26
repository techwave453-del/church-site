(()=>{
  const desktop=()=>window.matchMedia('(min-width:701px)').matches;

  const sync=()=>{
    if(!desktop())return;
    const root=document.querySelector('.hero.carousel .carousel-inner');
    if(!root)return false;

    root.querySelectorAll('.carousel-slide').forEach(slide=>{
      const media=slide.querySelector('.carousel-media');
      if(!media)return;
      const source=media.currentSrc||media.src||media.getAttribute('src');
      if(source){
        const safe=source.replace(/"/g,'\\"');
        slide.style.setProperty('--hero-image',`url("${safe}")`);
      }
    });
    return true;
  };

  const observe=()=>{
    if(!desktop())return;
    if(!sync()){
      requestAnimationFrame(()=>{
        if(!sync())setTimeout(sync,100);
      });
    }

    const root=document.querySelector('.hero.carousel .carousel-inner');
    if(root){
      const observer=new MutationObserver(sync);
      observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src']});
      window.addEventListener('resize',sync,{passive:true});
    }
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',observe,{once:true});
  }else observe();

  const bodyObserver=new MutationObserver(()=>{
    if(document.querySelector('.hero.carousel .carousel-inner')){
      observe();
      bodyObserver.disconnect();
    }
  });
  bodyObserver.observe(document.documentElement,{subtree:true,childList:true});
})();
