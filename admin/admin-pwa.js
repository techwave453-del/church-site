(function(){
  'use strict';

  function addManifest(){
    let link=document.querySelector('link[rel="manifest"][data-admin-pwa]');
    if(!link){
      link=document.createElement('link');
      link.rel='manifest';
      link.href='/admin-pwa.webmanifest';
      link.dataset.adminPwa='true';
      document.head.appendChild(link);
    }
  }

  function addInstallEntry(){
    const actions=document.querySelector('.admin-header__actions');
    if(!actions || document.getElementById('adminPwaInstall'))return;
    const link=document.createElement('a');
    link.id='adminPwaInstall';
    link.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';
    link.href='/admin-install.html';
    link.setAttribute('aria-label','Install Admin App');
    link.title='Install Admin App';
    link.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';
    actions.insertBefore(link,actions.firstChild);
  }

  function init(){
    addManifest();
    addInstallEntry();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
