(()=>{
  const setup=()=>{
    const root=document.querySelector('.hero.carousel');
    if(!root)return;
    const sync=()=>{
      root.querySelectorAll('.carousel-slide').forEach(slide=>{
        let bg=slide.querySelector('.hero-desktop-background');
        const media=slide.querySelector('.carousel-media');
        if(!media)return;
        if(!bg){
          bg=media.cloneNode(true);
          bg.classList.add('hero-desktop-background');
          bg.removeAttribute('alt');
          bg.setAttribute('aria-hidden','true');
          if(bg.tagName==='VIDEO'){
            bg.muted=true;
            bg.autoplay=true;
            bg.loop=true;
            bg.playsInline=true;
          }
          slide.insertBefore(bg,slide.firstChild);
        }
        if(bg.src!==media.currentSrc&&bg.src!==media.src)bg.src=media.currentSrc||media.src;
      });
    };
    sync();
    new MutationObserver(sync).observe(root,{subtree:true,attributes:true,attributeFilter:['class','src']});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
