(function(){
  // The new section-by-section navigation owns the admin UI. Do not load the
  // legacy admin-tabs module because it can re-apply the old three-tab behavior.
  const modules=['admin-utils.js','admin-session.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js'];
  let started=false;
  const buildVersion=window.__ADMIN_BUILD_VERSION||Date.now().toString();
  function setLoadingState(message){document.documentElement.classList.add('admin-modules-loading');const loading=document.getElementById('adminModuleLoading');if(loading){const text=loading.querySelector('[data-loading-text]');if(text)text.textContent=message||'Loading admin panel…';loading.hidden=false;}}
  function finishLoadingState(){document.documentElement.classList.remove('admin-modules-loading');const loading=document.getElementById('adminModuleLoading');if(loading)loading.hidden=true;}
  function loadScript(name){return new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-admin-module="${name}"]`);if(existing)return resolve();const s=document.createElement('script');s.src='/admin/'+name+'?v='+encodeURIComponent(buildVersion);s.dataset.adminModule=name;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+name));document.head.appendChild(s);});}
  async function loadCurrentUserIntoRBAC(){try{const meResponse=await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store'});if(!meResponse.ok)return false;const me=await meResponse.json();if(window.AdminRBAC){window.AdminRBAC.getCurrentUser=()=>me.user;window.AdminRBAC.hasPermission=(permission)=>me.user?.role==='super_admin'||(Array.isArray(me.user?.permissions)&&me.user.permissions.includes(permission));}return !!me.user;}catch(error){console.warn('Unable to load RBAC user profile:',error.message);return false;}}
  function hasPermission(permission){const user=window.AdminRBAC?.getCurrentUser?.();return user?.role==='super_admin'||window.AdminRBAC?.hasPermission?.(permission)===true;}
  window.loadAdminModules=async function(){if(started)return true;started=true;setLoadingState('Loading admin panel…');try{
    await loadScript('admin-utils.js');
    setLoadingState('Checking administrator access…');
    await loadScript('admin-session.js');
    const authenticated=window.initAdminSession?await window.initAdminSession():false;
    if(!authenticated){started=false;finishLoadingState();return false;}
    setLoadingState('Loading user access controls…');
    await loadScript('admin-users.js');
    if(window.AdminRBAC)await window.AdminRBAC.init();
    const hasUser=await loadCurrentUserIntoRBAC();
    if(!hasUser){started=false;finishLoadingState();return false;}

    setLoadingState('Loading permitted admin modules…');
    // Load the module code, but do not trigger protected data requests until
    // the authenticated user's permissions are known.
    for(const name of modules.slice(2))await loadScript(name);

    await loadScript('admin-navigation.js');
    window.AdminNavigation?.applyVisibility?.();
    try{await loadScript('admin-access-requests.js');if(window.AdminAccessRequests)await window.AdminAccessRequests.init();}catch(error){console.warn(error.message);}

    // Only initialize protected data sources the current administrator can view.
    // Previously these were called unconditionally, causing newly approved
    // restricted administrators to receive a 403 permission error immediately.
    setLoadingState('Loading permitted sections…');
    if(hasPermission('site.view')&&window.loadSiteContent)await window.loadSiteContent();
    if(hasPermission('media.view')&&window.loadMedia)await window.loadMedia();
    if(hasPermission('comments.view')&&window.loadAdminComments)await window.loadAdminComments();
    window.AdminNavigation?.applyVisibility?.();
    finishLoadingState();return true;
  }catch(error){console.error('Admin modules failed to initialize:',error);started=false;const loading=document.getElementById('adminModuleLoading');if(loading){const text=loading.querySelector('[data-loading-text]');if(text)text.textContent='Unable to finish loading the admin panel. Please refresh and try again.';}return false;}};
})();
