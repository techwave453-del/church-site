(function(){
  'use strict';
  // The Media section used to contain a legacy inline CMS. The Media Center
  // is now rendered by admin-media.js, so remove the legacy markup before
  // the module can initialize. This also prevents old cached/inline controls
  // from remaining visible when the module is delayed.
  function cleanup(){
    const root=document.getElementById('media');
    if(!root)return;
    if(root.dataset.mediaCenterReady==='1')return;
    root.innerHTML='';
    root.dataset.mediaLegacyRemoved='1';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
})();
