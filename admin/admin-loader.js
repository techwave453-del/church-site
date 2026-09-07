(function(){
  // Keep the server-rendered legacy admin shell invisible until the modular UI
  // has finished bootstrapping. This prevents the old UI from flashing before
  // the current section-by-section interface takes over.
  if(!document.getElementById('adminAppCriticalStyle')){
    const critical=document.createElement('style');
    critical.id='adminAppCriticalStyle';
    critical.textContent='html:not(.admin-ui-ready) #adminHeader,html:not(.admin-ui-ready) #app{visibility:hidden!important}';
    (document.head||document.documentElement).appendChild(critical);
  }
  document.documentElement.classList.remove('admin-ui-ready');
  document.documentElement.classList.add('admin-login-skeleton');

  // Hide the server-rendered legacy login before any asynchronous module can load.
  // admin-login-ui.js removes this gate synchronously once it replaces the markup.
  if(!document.getElementById('adminLoginCriticalStyle')){
    const critical=document.createElement('style');
    critical.id='adminLoginCriticalStyle';
    critical.textContent='html:not(.admin-login-ready) #login{visibility:hidden!important}
html.admin-login-skeleton #login{visibility:hidden!important}';
    (document.head||document.documentElement).appendChild(critical);
  }

  const modules=['admin-utils.js','admin-session.js','admin-theme.js','admin-media.js','admin-comments.js','admin-site-content.js','admin-services.js','admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js','admin-bridge.js','admin-cms.js'];
  let started=false;
  const buildVersion=window.__ADMIN_BUILD_VERSION||Date.now().toString();
  function setLoadingState(message){document.documentElement.classList.add('admin-modules-loading');const loading=document.getElementById('adminModuleLoading');if(loading){const text=loading.querySelector('[data-loading-text]');if(text)text.textContent=message||'Loading admin panel…';loading.hidden=false;}if(window.setAdminLoadingState)window.setAdminLoadingState(message);}
  function finishLoadingState(){document.documentElement.classList.add('admin-ui-ready');document.documentElement.classList.remove('admin-modules-loading');const loading=document.getElementById('adminModuleLoading');if(loading){loading.classList.add('is-complete');setTimeout(()=>{loading.hidden=true;loading.classList.remove('is-complete')},380);}}
  function loadScript(name){return new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-admin-module="${name}"]`);if(existing)return resolve();const s=document.createElement('script');s.src='/admin/'+name+'?v='+encodeURIComponent(buildVersion);s.dataset.adminModule=name;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+name));document.head.appendChild(s);});}
  async function loadCurrentUserIntoRBAC(){try{const meResponse=await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store'});if(!meResponse.ok)return false;const me=await meResponse.json();if(window.AdminRBAC){window.AdminRBAC.getCurrentUser=()=>me.user;window.AdminRBAC.hasPermission=(permission)=>me.user?.role==='super_admin'||(Array.isArray(me.user?.permissions)&&me.user.permissions.includes(permission));}return !!me.user;}catch(error){console.warn('Unable to load RBAC user profile:',error.message);return false;}}
  function hasPermission(permission){const user=window.AdminRBAC?.getCurrentUser?.();return user?.role==='super_admin'||window.AdminRBAC?.hasPermission?.(permission)===true;}
  window.loadAdminModules=async function(){if(started)return true;started=true;setLoadingState('Loading Administration…');try{
    await loadScript('admin-login-ui.js');
    await loadScript('admin-utils.js');
    setLoadingState('Connecting to administration server…');
    await loadScript('admin-session.js');
    const authenticated=window.initAdminSession?await window.initAdminSession():false;
    if(!authenticated){started=false;finishLoadingState();return false;}
    if(window.loadAdminBranding)await window.loadAdminBranding();
    setLoadingState('Initializing administration components…');
    await loadScript('admin-users.js');
    if(window.AdminRBAC)await window.AdminRBAC.init();
    const hasUser=await loadCurrentUserIntoRBAC();
    if(!hasUser){started=false;finishLoadingState();return false;}
    setLoadingState('Checking administrator permissions…');
    for(const name of modules.slice(2))await loadScript(name);
    await loadScript('admin-media-runtime-fix.js');
    await loadScript('admin-navigation.js');
    window.AdminNavigation?.applyVisibility?.();
    try{await loadScript('admin-access-requests.js');if(window.AdminAccessRequests)await window.AdminAccessRequests.init();}catch(error){console.warn(error.message);}
    // Admin PWA is initialized only after authentication and RBAC are ready.
    await loadScript('admin-pwa.js');
    setLoadingState('Preparing your permitted sections…');
    if(hasPermission('site.view')&&window.loadSiteContent)await window.loadSiteContent();
    if(hasPermission('media.view')&&window.loadMedia)await window.loadMedia();
    if(hasPermission('comments.view')&&window.loadAdminComments)await window.loadAdminComments();
    window.AdminNavigation?.applyVisibility?.();
    setLoadingState('Almost ready…');
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    finishLoadingState();return true;
  }catch(error){console.error('Admin modules failed to initialize:',error);started=false;setLoadingState('Unable to finish loading the admin panel. Please refresh and try again.');const loading=document.getElementById('adminModuleLoading');if(loading){const text=loading.querySelector('[data-loading-text]');if(text)text.textContent='Unable to finish loading the admin panel. Please refresh and try again.';const errorText=loading.querySelector('[data-loading-error]');if(errorText){errorText.hidden=false;errorText.textContent='Please refresh the page and try again.'}loading.querySelector('[data-loading-retry]')?.classList.add('show');}return false;}};
})();