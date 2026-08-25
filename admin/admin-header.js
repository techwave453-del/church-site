(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;

  if(!document.querySelector('link[data-admin-header-css]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-header.css';
    link.dataset.adminHeaderCss='true';
    document.head.appendChild(link);
  }

  // Keep the mobile Save Site Content controls visible even if the external
  // admin-header stylesheet is delayed or cached. This is intentionally
  // limited to the admin site's mobile save bar.
  if(!document.querySelector('style[data-admin-savebar-mobile]')){
    const style=document.createElement('style');
    style.dataset.adminSavebarMobile='true';
    style.textContent='@media(max-width:650px){#site .savebar{position:fixed!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;width:auto!important;margin:0!important;z-index:1100!important;display:flex!important;align-items:stretch!important;flex-direction:column!important;gap:8px!important;padding:10px!important;background:#fff!important;border:1px solid #dfe4e8!important;border-radius:12px!important;box-shadow:0 8px 30px #0003!important}#site .savebar #saveState{display:block!important;width:100%!important;font-size:13px!important}#site .savebar .toolbar{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#site .savebar .toolbar button{width:100%!important;min-height:44px!important}}';
    document.head.appendChild(style);
  }

  mount.innerHTML='<header class="admin-header"><strong class="admin-header__title">Kingdom Fellowship Christian Church — Admin</strong><div class="admin-header__actions"><span id="apiStatus" class="admin-header__status">Checking…</span><a class="secondary small admin-header__back" href="/" aria-label="Back to website">← Back to Website</a><button class="secondary small" type="button" onclick="logout()">Log out</button></div></header>';

  const load=()=>{
    const loader=document.createElement('script');
    loader.src='/admin/admin-loader.js';
    loader.onload=function(){
      if(window.loadAdminModules){
        window.loadAdminModules().catch(e=>console.error(e));
      }
    };
    loader.onerror=function(){
      console.error('Failed to load admin module loader.');
    };
    document.head.appendChild(loader);
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',load,{once:true});
  }else{
    load();
  }
})();
