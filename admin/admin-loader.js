(function(){
  const modules=['admin-utils.js','admin-session.js','admin-tabs.js','admin-navigation.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js'];
  let started=false;

  // Admin modules are frequently changed independently. Use a per-page cache-buster
  // so mobile browsers cannot briefly execute an older cached module while the new
  // modular UI is being assembled.
  const buildVersion=window.__ADMIN_BUILD_VERSION||Date.now().toString();

  function setLoadingState(message){
    document.documentElement.classList.add('admin-modules-loading');
    const loading=document.getElementById('adminModuleLoading');
    if(loading){
      const text=loading.querySelector('[data-loading-text]');
      if(text)text.textContent=message||'Loading admin panel…';
      loading.hidden=false;
    }
  }

  function finishLoadingState(){
    document.documentElement.classList.remove('admin-modules-loading');
    const loading=document.getElementById('adminModuleLoading');
    if(loading)loading.hidden=true;
  }

  function loadScript(name){
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector(`script[data-admin-module="${name}"]`);
      if(existing)return resolve();
      const s=document.createElement('script');
      s.src='/admin/'+name+'?v='+encodeURIComponent(buildVersion);
      s.dataset.adminModule=name;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Failed to load '+name));
      document.head.appendChild(s);
    });
  }

  window.loadAdminModules=async function(){
    if(started)return true;
    started=true;
    setLoadingState('Loading admin panel…');
    try{
      await loadScript('admin-utils.js');
      setLoadingState('Checking administrator access…');
      await loadScript('admin-session.js');
      const authenticated=window.initAdminSession?await window.initAdminSession():false;
      if(!authenticated){started=false;finishLoadingState();return false;}
      setLoadingState('Loading admin modules…');
      for(const name of modules.slice(2))await loadScript(name);
      setLoadingState('Loading user access controls…');
      await loadScript('admin-users.js');

      // RBAC must build #adminRbac before the pending-approval module is initialized.
      // Previously access requests initialized first, found no mount point, and exited;
      // as a result the Pending Approval UI never appeared in Users & Permissions.
      if(window.AdminRBAC)await window.AdminRBAC.init();
      try{await loadScript('admin-access-requests.js');if(window.AdminAccessRequests)await window.AdminAccessRequests.init();}catch(error){console.warn(error.message);}

      try{const meResponse=await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store'});if(meResponse.ok){const me=await meResponse.json();if(window.AdminRBAC){window.AdminRBAC.getCurrentUser=()=>me.user;window.AdminRBAC.hasPermission=(permission)=>me.user?.role==='super_admin'||(Array.isArray(me.user?.permissions)&&me.user.permissions.includes(permission));}}}catch(error){console.warn('Unable to load RBAC user profile:',error.message);}
      setLoadingState('Loading website content…');
      if(window.loadSiteContent)await window.loadSiteContent();
      if(window.loadMedia)await window.loadMedia();
      if(window.loadAdminComments)await window.loadAdminComments();
      window.AdminNavigation?.applyVisibility?.();
      finishLoadingState();
      return true;
    }catch(error){
      console.error('Admin modules failed to initialize:',error);
      started=false;
      const loading=document.getElementById('adminModuleLoading');
      if(loading){
        const text=loading.querySelector('[data-loading-text]');
        if(text)text.textContent='Unable to finish loading the admin panel. Please refresh and try again.';
      }
      return false;
    }
  };
})();