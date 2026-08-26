(()=>{
  const desktop=()=>window.matchMedia('(min-width:701px)').matches;
  let rootObserver=null;
  let bodyObserver=null;

  const sync=()=>{
    if(!desktop())return false;
    const root=document.querySelector('.hero.carousel .carousel-inner');
    if(!root)return false;
    root.querySelectorAll('.carousel-slide').forEach(slide=>{
      const media=slide.querySelector('.carousel-media');
      if(!media)return;
      const source=media.currentSrc||media.getAttribute('src')||media.src||media.getAttribute('poster');
      if(!source)return;
      slide.style.setProperty('--hero-image',`url("${String(source).replace(/"/g,'\\"')}")`);
      slide.classList.add('hero-image-ready');
    });
    return true;
  };

  const observeRoot=()=>{
    if(!desktop())return;
    const root=document.querySelector('.hero.carousel .carousel-inner');
    if(!root)return;
    sync();
    if(rootObserver)rootObserver.disconnect();
    rootObserver=new MutationObserver(()=>requestAnimationFrame(sync));
    rootObserver.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src','currentSrc','poster']});
  };

  const observe=()=>{
    if(!desktop())return;
    if(!document.querySelector('.hero.carousel .carousel-inner')){
      if(!bodyObserver){
        bodyObserver=new MutationObserver(()=>{
          if(document.querySelector('.hero.carousel .carousel-inner')){
            bodyObserver.disconnect();
            bodyObserver=null;
            observeRoot();
          }
        });
        bodyObserver.observe(document.documentElement,{subtree:true,childList:true});
      }
      return;
    }
    observeRoot();
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});
  else observe();
  window.addEventListener('resize',observe,{passive:true});
})();