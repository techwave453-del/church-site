(function(){
  // Keep only the authenticated admin shell hidden during bootstrap. The login
  // screen must remain paintable on every viewport while the branded UI loads.
  if(!document.getElementById('adminAppCriticalStyle')){
    const critical=document.createElement('style');
    critical.id='adminAppCriticalStyle';
    critical.textContent='html:not(.admin-ui-ready) #adminHeader,html:not(.admin-ui-ready) #app{visibility:hidden!important}';
    (document.head||document.documentElement).appendChild(critical);
  }

  document.documentElement.classList.remove('admin-ui-ready','admin-login-ready');
  document.documentElement.classList.add('admin-login-skeleton');

  // The skeleton is the only first-paint login layer. admin-login-ui.js replaces
  // the legacy #login contents with the current branded interface before the
  // skeleton is dismissed, preventing the old form from flashing on screen.
  if(!document.getElementById('adminLoginCriticalStyle')){
    const critical=document.createElement('style');
    critical.id='adminLoginCriticalStyle';
    critical.textContent='html.admin-login-skeleton #login{visibility:visible!important;opacity:1!important}\n@media(max-width:900px){body.admin-login-page{min-height:100dvh;background:#07111f}body.admin-login-page main{width:100%;min-height:100dvh}}';
    (document.head||document.documentElement).appendChild(critical);
  }

  const modules=[
    'admin-utils.js','admin-session.js','admin-theme.js','admin-media.js',
    'admin-comments.js','admin-site-content.js','admin-services.js',
    'admin-homepage-links.js','admin-classes.js','admin-gallery.js','admin-live.js',
    'admin-bridge.js','admin-cms.js'
  ];
  let started=false;
  let authenticated=false;
  const buildVersion=window.__ADMIN_BUILD_VERSION||Date.now().toString();

  function setLoadingState(message){
    document.documentElement.classList.add('admin-modules-loading');
    if(window.adminLoadingScreen?.visible)window.adminLoadingScreen.setMessage(message||'Loading admin panel…');
    if(window.setAdminLoadingState)window.setAdminLoadingState(message);
  }

  function finishLoadingState(){
    document.documentElement.classList.add('admin-ui-ready');
    document.documentElement.classList.remove('admin-modules-loading','admin-login-skeleton');
    window.adminLoadingScreen?.hide();
  }

  function showBootstrapError(error){
    console.error('Admin modules failed to initialize:',error);
    document.documentElement.classList.add('admin-ui-ready');
    document.documentElement.classList.remove('admin-modules-loading','admin-login-skeleton');
    window.adminLoadingScreen?.showError('A required administrator component did not initialize correctly.',()=>{
      started=false;
      authenticated=false;
      document.documentElement.classList.remove('admin-ui-ready','admin-login-ready');
      document.documentElement.classList.add('admin-login-skeleton');
      window.adminLoadingScreen?.hide();
      window.loadAdminModules();
    });
  }

  function showLoginBootstrapWarning(error){
    console.warn('Admin pre-auth bootstrap warning:',error);
    document.documentElement.classList.add('admin-ui-ready','admin-login-ready');
    document.documentElement.classList.remove('admin-modules-loading','admin-login-skeleton');
    window.adminLoadingScreen?.hide();
    const login=document.getElementById('login');
    if(!login)return;
    let warning=document.getElementById('adminBootstrapWarning');
    if(!warning){
      warning=document.createElement('div');
      warning.id='adminBootstrapWarning';
      warning.style.cssText='margin:16px auto;max-width:520px;padding:12px 14px;border-radius:10px;background:#fff3cd;color:#7a5b00;border:1px solid #ffe08a;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;position:relative;z-index:100001';
      warning.textContent='Some administrator components did not finish loading. You can retry without losing the current login screen.';
      login.parentNode.insertBefore(warning,login);
    }
  }

  function loadScript(name){
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector(`script[data-admin-module="${name}"]`);
      if(existing)return resolve();
      const s=document.createElement('script');
      let settled=false;
      const timer=setTimeout(()=>{
        if(settled)return;
        settled=true;
        s.remove();
        reject(new Error('Timed out while loading '+name));
      },15000);
      s.src='/admin/'+name+'?v='+encodeURIComponent(buildVersion);
      s.dataset.adminModule=name;
      s.onload=()=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        resolve();
      };
      s.onerror=()=>{
        if(settled)return;
        settled=true;
        clearTimeout(timer);
        reject(new Error('Failed to load '+name));
      };
      document.head.appendChild(s);
    });
  }

  async function loadCurrentUserIntoRBAC(){
    try{
      const meResponse=await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store'});
      if(!meResponse.ok)return false;
      const me=await meResponse.json();
      if(window.AdminRBAC){
        window.AdminRBAC.getCurrentUser=()=>me.user;
        window.AdminRBAC.hasPermission=(permission)=>me.user?.role==='super_admin'||(Array.isArray(me.user?.permissions)&&me.user.permissions.includes(permission));
      }
      return !!me.user;
    }catch(error){
      console.warn('Unable to load RBAC user profile:',error.message);
      return false;
    }
  }

  function hasPermission(permission){
    const user=window.AdminRBAC?.getCurrentUser?.();
    return user?.role==='super_admin'||window.AdminRBAC?.hasPermission?.(permission)===true;
  }

  window.loadAdminModules=async function(){
    if(started)return true;
    started=true;
    authenticated=false;
    setLoadingState('Loading Administration…');
    try{
      await loadScript('admin-loading.js');
      await loadScript('admin-login-ui.js');
      await loadScript('admin-utils.js');
      setLoadingState('Connecting to administration server…');
      await loadScript('admin-session.js');
      authenticated=window.initAdminSession?await window.initAdminSession():false;
      if(!authenticated){
        started=false;
        finishLoadingState();
        return false;
      }
      // This is the dedicated post-authentication screen. It is intentionally
      // separate from the login skeleton and remains visible until the full
      // dashboard and permitted modules are ready.
      window.adminLoadingScreen?.show('Loading your administration workspace…');
      if(window.loadAdminBranding)await window.loadAdminBranding();
      setLoadingState('Initializing administration components…');
      await loadScript('admin-users.js');
      if(window.AdminRBAC)await window.AdminRBAC.init();
      const hasUser=await loadCurrentUserIntoRBAC();
      if(!hasUser){
        started=false;
        window.adminLoadingScreen?.showError('Your administrator session could not be verified.',()=>location.reload());
        return false;
      }
      setLoadingState('Checking administrator permissions…');
      for(const name of modules.slice(2))await loadScript(name);
      await loadScript('admin-media-runtime-fix.js');
      await loadScript('admin-navigation.js');
      window.AdminNavigation?.applyVisibility?.();
      try{
        await loadScript('admin-access-requests.js');
        if(window.AdminAccessRequests)await window.AdminAccessRequests.init();
      }catch(error){console.warn(error.message)}
      await loadScript('admin-pwa.js');
      setLoadingState('Preparing your permitted sections…');
      if(hasPermission('site.view')&&window.loadSiteContent)await window.loadSiteContent();
      if(hasPermission('media.view')&&window.loadMedia)await window.loadMedia();
      if(hasPermission('comments.view')&&window.loadAdminComments)await window.loadAdminComments();
      window.AdminNavigation?.applyVisibility?.();
      setLoadingState('Almost ready…');
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      finishLoadingState();
      return true;
    }catch(error){
      started=false;
      if(authenticated)showBootstrapError(error);
      else showLoginBootstrapWarning(error);
      return false;
    }
  };
})();