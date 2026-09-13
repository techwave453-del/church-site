(function(){
  'use strict';
  // Keep the Media Center independent from site-content failures and make the
  // patch resilient to the order in which the admin modules finish loading.
  function install(){
    if(window.__mediaRuntimeFixInstalled)return;
    if(typeof window.loadMedia!=='function'||typeof window.adminApi!=='function')return;

    const originalApi=window.adminApi;
    const originalLoadMedia=window.loadMedia;
    if(typeof originalLoadMedia!=='function')return;

    window.__mediaRuntimeFixInstalled=true;
    window.__originalAdminLoadMedia=originalLoadMedia;

    window.loadMedia=async function(){
      const wrappedApi=async function(url,options={}){
        const method=String(options.method||'GET').toUpperCase();
        if(url==='/api/site/content'&&method==='GET'){
          try{
            const response=await originalApi(url,options);
            if(response.ok)return response;
            console.warn('Media Center: site content unavailable; continuing with media library.',response.status);
          }catch(error){
            console.warn('Media Center: site content request failed; continuing with media library.',error?.message||error);
          }
          return new Response('{}',{status:200,headers:{'Content-Type':'application/json'}});
        }
        return originalApi(url,options);
      };

      window.adminApi=wrappedApi;
      try{
        return await originalLoadMedia();
      }finally{
        window.adminApi=originalApi;
      }
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  const observer=new MutationObserver(install);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(install,0);
  setTimeout(install,250);
  setTimeout(install,1000);
})();
