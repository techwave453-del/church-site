(function(){
  const modules=['admin-utils.js','admin-session.js','admin-tabs.js','admin-navigation.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js'];
  function loadScript(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/admin/'+name;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+name));document.head.appendChild(s);});}
  window.loadAdminModules=async function(){
    await loadScript('admin-utils.js');
    await loadScript('admin-session.js');
    const authenticated=window.initAdminSession?await window.initAdminSession():false;
    if(!authenticated)return false;
    for(const name of modules.slice(2))await loadScript(name);
    await loadScript('admin-users.js');
    try{await loadScript('admin-access-requests.js');if(window.AdminAccessRequests)await window.AdminAccessRequests.init();}catch(error){console.warn(error.message);}
    if(window.AdminRBAC)await window.AdminRBAC.init();
    try{const meResponse=await fetch('/api/admin/me',{credentials:'same-origin'});if(meResponse.ok){const me=await meResponse.json();if(window.AdminRBAC){window.AdminRBAC.getCurrentUser=()=>me.user;window.AdminRBAC.hasPermission=(permission)=>me.user?.role==='super_admin'||(Array.isArray(me.user?.permissions)&&me.user.permissions.includes(permission));}}}catch(error){console.warn('Unable to load RBAC user profile:',error.message);}
    if(window.loadSiteContent)await window.loadSiteContent();
    if(window.loadMedia)await window.loadMedia();
    if(window.loadAdminComments)await window.loadAdminComments();
    window.AdminNavigation?.applyVisibility?.();
    return true;
  };
})();
