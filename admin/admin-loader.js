(function(){
  const modules=['admin-utils.js','admin-session.js','admin-tabs.js','admin-navigation.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js'];
  function loadScript(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/admin/'+name;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+name));document.head.appendChild(s);});}
  window.loadAdminModules=async function(){
    await loadScript('admin-utils.js');
    await loadScript('admin-session.js');
    const authenticated=window.initAdminSession?await window.initAdminSession():false;
    if(!authenticated)return false;
    for(const name of modules.slice(2))await loadScript(name);
    const rbac=document.createElement('script');
    rbac.src='/admin/admin-users.js';
    await new Promise((resolve,reject)=>{rbac.onload=resolve;rbac.onerror=()=>reject(new Error('Failed to load admin users module'));document.head.appendChild(rbac);});
    if(window.AdminRBAC)await window.AdminRBAC.init();
    const accessRequests=document.createElement('script');
    accessRequests.src='/admin/admin-access-requests.js';
    await new Promise((resolve,reject)=>{accessRequests.onload=resolve;accessRequests.onerror=()=>reject(new Error('Failed to load admin access requests module'));document.head.appendChild(accessRequests);});
    if(window.AdminAccessRequests)await window.AdminAccessRequests.init();
    if(window.loadSiteContent)await window.loadSiteContent();
    if(window.loadMedia)await window.loadMedia();
    if(window.loadAdminComments)await window.loadAdminComments();
    window.AdminNavigation?.applyVisibility?.();
    return true;
  };
})();
