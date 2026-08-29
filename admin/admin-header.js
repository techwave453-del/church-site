(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;

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

  mount.innerHTML='<header class="admin-header"><strong class="admin-header__title">Kingdom Fellowship Christian Church — Admin</strong><div class="admin-header__actions"><span id="apiStatus" class="admin-header__status">Checking…</span><a class="secondary small admin-header__back" href="/" aria-label="Back to website">← Back to Website</a><button id="adminLogout" class="secondary small" type="button" onclick="logout()" hidden>Log out</button></div></header>';

  window.setAdminAuthenticatedUI=function(authenticated){
    const logoutButton=document.getElementById('adminLogout');
    if(logoutButton)logoutButton.hidden=!authenticated;
    document.body.classList.toggle('admin-authenticated',!!authenticated);
  };

  function installPasswordToggles(){
    document.querySelectorAll('input[type="password"]').forEach(input=>{
      if(input.dataset.passwordToggleReady==='true')return;
      input.dataset.passwordToggleReady='true';
      const wrapper=document.createElement('div');
      wrapper.className='admin-password-wrap';
      input.parentNode.insertBefore(wrapper,input);
      wrapper.appendChild(input);
      const button=document.createElement('button');
      button.type='button';
      button.className='admin-password-toggle';
      button.setAttribute('aria-label','Show password');
      button.setAttribute('aria-pressed','false');
      button.title='Show password';
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>';
      button.addEventListener('click',()=>{
        const showing=input.type==='text';
        input.type=showing?'password':'text';
        button.setAttribute('aria-label',showing?'Show password':'Hide password');
        button.setAttribute('aria-pressed',String(!showing));
        button.title=showing?'Show password':'Hide password';
        button.innerHTML=showing
          ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 3 18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.3 0 9.9 6 9.9 6a17.7 17.7 0 0 1-3.5 3.9M6.1 6.1C3.7 7.5 2.1 12 2.1 12s3.6 6 9.9 6c1.2 0 2.3-.2 3.3-.6"/><path d="M9.5 9.5a3.5 3.5 0 0 0 5 5"/></svg>';
      });
      if(!document.getElementById('admin-password-toggle-style')){
        const style=document.createElement('style');
        style.id='admin-password-toggle-style';
        style.textContent='.admin-password-wrap{position:relative;width:100%}.admin-password-wrap>input{padding-right:48px!important}.admin-password-toggle{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:38px!important;height:38px!important;margin:0!important;padding:8px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#66717d!important;display:grid!important;place-items:center!important;cursor:pointer!important;box-shadow:none!important}.admin-password-toggle:hover{background:#eef2f5!important;color:#18202a!important}.admin-password-toggle:focus-visible{outline:2px solid #0b6bcb;outline-offset:1px}.admin-password-toggle svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}';
        document.head.appendChild(style);
      }
    });
  }
  installPasswordToggles();
  new MutationObserver(installPasswordToggles).observe(document.body,{childList:true,subtree:true});

  const load=()=>{
    const loader=document.createElement('script');
    loader.src='/admin/admin-loader.js?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION);
    loader.dataset.adminModule='admin-loader.js';
    loader.onload=function(){if(window.loadAdminModules)window.loadAdminModules().catch(e=>console.error(e));};
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