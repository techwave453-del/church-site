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
    critical.textContent='html:not(.admin-login-ready) #login{visibility:hidden!important}\nhtml.admin-login-skeleton #login{visibility:hidden!important}';
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
    const loading=document.getElementById('adminModuleLoading');
    if(loading){
      const text=loading.querySelector('[data-loading-text]');
      if(text)text.textContent=message||'Loading admin panel…';
      loading.hidden=false;
    }
    if(window.setAdminLoadingState)window.setAdminLoadingState(message);
  }

  function finishLoadingState(){
    document.documentElement.classList.add('admin-ui-ready');
    document.documentElement.classList.remove('admin-modules-loading');
    const loading=document.getElementById('adminModuleLoading');
    if(loading){
      loading.classList.add('is-complete');
      setTimeout(()=>{
        loading.hidden=true;
        loading.classList.remove('is-complete');
      },380);
    }
  }

  function ensureBootstrapErrorStyles(){
    if(document.getElementById('adminBootstrapErrorStyle'))return;
    const style=document.createElement('style');
    style.id='adminBootstrapErrorStyle';
    style.textContent='\n      #adminBootstrapError{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:24px;background:var(--bg,#f5f7f9);color:var(--ink,#18202a);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}\n      #adminBootstrapError .admin-bootstrap-error-card{width:min(520px,100%);background:#fff;border:1px solid #dfe4e8;border-radius:18px;padding:28px;box-shadow:0 18px 60px #0002;text-align:center}\n      #adminBootstrapError h2{margin:0 0 8px;font-size:22px}\n      #adminBootstrapError p{margin:0 0 18px;color:#66717d}\n      #adminBootstrapError button{border:0;border-radius:10px;padding:11px 18px;background:#17202b;color:#fff;font:inherit;font-weight:700;cursor:pointer}\n      #adminBootstrapError button:focus-visible{outline:3px solid #0b6bcb;outline-offset:2px}\n    ';
    (document.head||document.documentElement).appendChild(style);
  }

  function showBootstrapError(error){
    console.error('Admin modules failed to initialize:',error);
    document.documentElement.classList.add('admin-ui-ready');
    document.documentElement.classList.remove('admin-modules-loading','admin-login-skeleton');
    document.documentElement.classList.add('admin-login-ready');

    const existing=document.getElementById('adminBootstrapError');
    if(existing)existing.remove();
    ensureBootstrapErrorStyles();

    const panel=document.createElement('div');
    panel.id='adminBootstrapError';
    panel.setAttribute('role','alert');
    panel.innerHTML='<div class="admin-bootstrap-error-card"><h2>Admin panel could not finish loading</h2><p>The latest administrator interface is still intact, but one of its components did not initialize correctly. Refresh and try again.</p><button type="button" data-admin-bootstrap-retry>Retry</button></div>';
    document.body.appendChild(panel);
    panel.querySelector('[data-admin-bootstrap-retry]').addEventListener('click',()=>{
      panel.remove();
      started=false;
      authenticated=false;
      document.documentElement.classList.remove('admin-ui-ready','admin-login-ready');
      document.documentElement.classList.add('admin-login-skeleton');
      window.loadAdminModules();
    });
  }

  function showLoginBootstrapWarning(error){
    console.warn('Admin pre-auth bootstrap warning:',error);
    document.documentElement.classList.add('admin-ui-ready','admin-login-ready');
    document.documentElement.classList.remove('admin-modules-loading','admin-login-skeleton');

    const login=document.getElementById('login');
    if(!login)return showBootstrapError(error);
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

      if(window.loadAdminBranding)await window.loadAdminBranding();
      setLoadingState('Initializing administration components…');
      await loadScript('admin-users.js');
      if(window.AdminRBAC)await window.AdminRBAC.init();

      const hasUser=await loadCurrentUserIntoRBAC();
      if(!hasUser){
        started=false;
        finishLoadingState();
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
      }catch(error){
        console.warn(error.message);
      }

      // Admin PWA is initialized only after authentication and RBAC are ready.
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