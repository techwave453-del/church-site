(function(){
  'use strict';
  // Media Center is rendered by admin-media.js. Do not clear the media
  // container before that module has had a chance to initialize.
  function normalizeMediaNavigation(){
    document.querySelectorAll('.admin-navigation [data-view="media"], .admin-navigation [data-tab="media"]').forEach(item=>{
      if(item.textContent.trim()==='Media Library')item.textContent='Media Center';
      item.setAttribute('aria-label','Media Center');
    });
  }
  function cleanup(){ normalizeMediaNavigation(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
  const observer=new MutationObserver(()=>normalizeMediaNavigation());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
})();
