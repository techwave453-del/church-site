(function(){
  'use strict';
  function youtubeThumbnail(url){
    const value=String(url||'');
    const match=value.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    return match?`https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`:'';
  }
  function patchVideoCards(){
    document.querySelectorAll('#mediaList .am-card').forEach(card=>{
      const video=card.querySelector('.am-preview video');
      if(!video)return;
      const thumb=youtubeThumbnail(video.getAttribute('src')||'');
      if(!thumb)return;
      const img=document.createElement('img');
      img.src=thumb;
      img.alt=card.querySelector('.am-card-title')?.textContent?.trim()||'Video thumbnail';
      img.loading='lazy';
      img.className='am-video-thumbnail';
      video.replaceWith(img);
    });
  }
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
        if(url==='/api/media'&&method==='GET'){
          const response=await originalApi(url,options);
          if(!response.ok)return response;
          try{
            const data=await response.clone().json();
            const items=Array.isArray(data)?data:[];
            const enriched=items.map(item=>({...item,thumbnail_url:item.thumbnail_url||youtubeThumbnail(item.url)}));
            return new Response(JSON.stringify(enriched),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}});
          }catch(error){
            console.warn('Media Center: unable to enrich media thumbnails.',error?.message||error);
          }
          return response;
        }
        return originalApi(url,options);
      };
      window.adminApi=wrappedApi;
      try{
        const result=await originalLoadMedia();
        setTimeout(patchVideoCards,0);
        setTimeout(patchVideoCards,250);
        return result;
      }finally{
        window.adminApi=originalApi;
      }
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  const observer=new MutationObserver(()=>{install();patchVideoCards();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(install,0);
  setTimeout(install,250);
  setTimeout(install,1000);
})();