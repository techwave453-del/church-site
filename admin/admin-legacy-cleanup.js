(function(){
  'use strict';
  // The Media section used to contain a legacy inline CMS. The Media Center
  // is now rendered by admin-media.js, so remove the legacy markup before
  // the module can initialize. This also prevents old cached/inline controls
  // from remaining visible when the module is delayed.
  function cleanup(){
    const root=document.getElementById('media');
    if(!root)return;
    if(root.dataset.mediaCenterReady!=='1'){
      root.innerHTML='';
      root.dataset.mediaLegacyRemoved='1';
    }
    normalizeMediaNavigation();
  }
  function normalizeMediaNavigation(){
    document.querySelectorAll('.admin-navigation [data-view="media"], .admin-navigation [data-tab="media"]').forEach(item=>{
      if(item.textContent.trim()==='Media Library')item.textContent='Media Center';
      item.setAttribute('aria-label','Media Center');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
  const observer=new MutationObserver(()=>normalizeMediaNavigation());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
})();
