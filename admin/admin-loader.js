(function(){
  const modules=['admin-utils.js','admin-session.js','admin-tabs.js','admin-navigation.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js'];
  window.loadAdminModules=async function(){
    for(const name of modules){
      await new Promise((resolve,reject)=>{
        const s=document.createElement('script');
        s.src='/admin/'+name;
        s.onload=resolve;
        s.onerror=()=>reject(new Error('Failed to load '+name));
        document.head.appendChild(s);
      });
    }
    if(window.initAdminSession)await window.initAdminSession();
  };
})();
