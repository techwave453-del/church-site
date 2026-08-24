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