(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;

  // Give every admin page load a fresh module version so mobile browsers do not
  // render stale cached JavaScript while the modular admin UI is initializing.
  window.__ADMIN_BUILD_VERSION=Date.now().toString();

  if(!document.querySelector('link[data-admin-header-css]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-header.css?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION);
    link.dataset.adminHeaderCss='true';
    document.head.appendChild(link);
  }

  if(!document.querySelector('style[data-admin-savebar-mobile]')){
    const style=document.createElement('style');
    style.dataset.adminSavebarMobile='true';
    style.textContent='@media(max-width:650px){#site .savebar{position:fixed!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;width:auto!important;margin:0!important;z-index:1100!important;display:flex!important;align-items:stretch!important;flex-direction:column!important;gap:8px!important;padding:10px!important;background:#fff!important;border:1px solid #dfe4e8!important;border-radius:12px!important;box-shadow:0 8px 30px #0003!important}#site .savebar #saveState{display:block!important;width:100%!important;font-size:13px!important}#site .savebar .toolbar{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#site .savebar .toolbar button{width:100%!important;min-height:44px!important}}';
    document.head.appendChild(style);
  }

  if(!document.getElementById('adminModuleLoading')){
    const loading=document.createElement('div');
    loading.id='adminModuleLoading';
    loading.hidden=false;
    loading.setAttribute('role','status');
    loading.setAttribute('aria-live','polite');
    loading.innerHTML='<div class="admin-module-loading-card"><span class="admin-module-spinner" aria-hidden="true"></span><strong data-loading-text>Loading admin panel…</strong><small>Please wait while the latest admin modules are loaded.</small></div>';
    document.body.appendChild(loading);
    const style=document.createElement('style');
    style.dataset.adminLoadingState='true';
    style.textContent='#adminModuleLoading{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(245,247,249,.96);text-align:center}#adminModuleLoading[hidden]{display:none!important}.admin-module-loading-card{width:min(360px,100%);padding:24px 20px;background:#fff;border:1px solid #dfe4e8;border-radius:16px;box-shadow:0 14px 45px rgba(0,0,0,.14);display:flex;flex-direction:column;align-items:center;gap:8px}.admin-module-loading-card small{color:#66717d}.admin-module-spinner{width:30px;height:30px;border:3px solid #dfe4e8;border-top-color:#0b6bcb;border-radius:50%;animation:adminModuleSpin .8s linear infinite}@keyframes adminModuleSpin{to{transform:rotate(360deg)}}@media(max-width:650px){#adminModuleLoading{padding:14px}.admin-module-loading-card{padding:22px 16px;border-radius:14px}}';
    document.head.appendChild(style);
  }

  // The logout control is deliberately hidden until the server confirms that
  // a valid authenticated session exists. The old implementation rendered Log
  // out for every visitor, which made the login form and authenticated controls
  // appear together on a fresh/expired session.
  mount.innerHTML='<header class="admin-header"><strong class="admin-header__title">Kingdom Fellowship Christian Church — Admin</strong><div class="admin-header__actions"><span id="apiStatus" class="admin-header__status">Checking…</span><a class="secondary small admin-header__back" href="/" aria-label="Back to website">← Back to Website</a><button id="adminLogout" class="secondary small" type="button" onclick="logout()" hidden>Log out</button></div></header>';

  window.setAdminAuthenticatedUI=function(authenticated){
    const logoutButton=document.getElementById('adminLogout');
    if(logoutButton)logoutButton.hidden=!authenticated;
    document.body.classList.toggle('admin-authenticated',!!authenticated);
  };

  const load=()=>{
    const loader=document.createElement('script');
    loader.src='/admin/admin-loader.js?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION);
    loader.dataset.adminModule='admin-loader.js';
    loader.onload=function(){
      if(window.loadAdminModules)window.loadAdminModules().catch(e=>console.error(e));
    };
    loader.onerror=function(){
      const loading=document.getElementById('adminModuleLoading');
      if(loading){loading.hidden=false;const text=loading.querySelector('[data-loading-text]');if(text)text.textContent='Unable to load the admin loader. Please refresh and try again.';}
      console.error('Failed to load admin module loader.');
    };
    document.head.appendChild(loader);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();