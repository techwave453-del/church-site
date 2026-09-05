(function(){
  'use strict';
  // Media must remain usable even if the separate site-content request fails.
  // The media module previously used Promise.all(/api/media + /api/site/content),
  // so an unrelated site-content error prevented the existing library from rendering.
  function install(){
    if(typeof window.loadMedia!=='function'||window.__mediaRuntimeFixInstalled)return;
    window.__mediaRuntimeFixInstalled=true;
    const originalApi=window.adminApi;
    if(typeof originalApi!=='function')return;
    window.loadMedia=async function(){
      const wrappedApi=async function(url,options={}){
        const method=String(options.method||'GET').toUpperCase();
        if(url==='/api/site/content'&&method==='GET'){
          try{
            const response=await originalApi(url,options);
            if(response.ok)return response;
            console.warn('Media Center: site content unavailable; continuing with media library.',response.status);
          }catch(error){
            console.warn('Media Center: site content request failed; continuing with media library.',error.message);
          }
          return new Response('{}',{status:200,headers:{'Content-Type':'application/json'}});
        }
        return originalApi(url,options);
      };
      window.adminApi=wrappedApi;
      try{return await window.__originalAdminLoadMedia();}
      finally{window.adminApi=originalApi;}
    };
    window.__originalAdminLoadMedia=original;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  const observer=new MutationObserver(install);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
