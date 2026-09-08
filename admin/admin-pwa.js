(function(){
  'use strict';

  let deferredPrompt=null;
  let installed=false;
  let initialized=false;
  const ADMIN_MANIFEST='/admin-pwa.webmanifest?v=admin-5';
  const ADMIN_WORKER='/admin/admin-service-worker.js?v=admin-2';

  function isAdminStandalone(){
    return window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone===true ||
      document.referrer.startsWith('android-app://');
  }

  function addManifest(){
    let link=document.querySelector('link[rel="manifest"][data-admin-pwa]');
    if(!link){
      link=document.createElement('link');
      link.rel='manifest';
      link.dataset.adminPwa='true';
      document.head.appendChild(link);
    }
    link.href=ADMIN_MANIFEST;
  }

  function button(){return document.getElementById('adminPwaInstall')}

  function setButtonState(){
    const b=button();
    if(!b)return;
    const standalone=installed||isAdminStandalone();
    b.hidden=false;
    b.disabled=false;
    b.dataset.installReady=deferredPrompt?'true':'false';
    b.setAttribute('aria-label',standalone?'Admin App Installed':'Install Admin App');
    b.title=standalone?'Admin App Installed':'Install Admin App';
    b.classList.toggle('is-installed',standalone);
    b.classList.toggle('is-ready',!!deferredPrompt&&!standalone);
    b.innerHTML=standalone
      ?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>'
      :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';
  }

  function addInstallEntry(){
    const actions=document.querySelector('.admin-header__actions');
    if(!actions||button())return;
    const b=document.createElement('button');
    b.id='adminPwaInstall';
    b.type='button';
    b.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';
    b.setAttribute('aria-label','Install Admin App');
    b.title='Install Admin App';
    b.addEventListener('click',install);
    actions.insertBefore(b,actions.firstChild);
    setButtonState();
  }

  function ensure(){addInstallEntry();setButtonState()}

  async function install(){
    if(installed||isAdminStandalone())return;

    if(deferredPrompt){
      const prompt=deferredPrompt;
      deferredPrompt=null;
      await prompt.prompt();
      const result=await prompt.userChoice.catch(()=>null);
      if(result?.outcome==='accepted')installed=true;
      setButtonState();
      return;
    }

    window.location.assign('/admin-install.html');
  }

  async function registerAdminWorker(){
    if(!('serviceWorker' in navigator))return;
    try{
      await navigator.serviceWorker.register(ADMIN_WORKER,{scope:'/admin/'});
    }catch(error){
      console.warn('Admin PWA service worker registration failed:',error);
    }
  }

  window.addEventListener('beforeinstallprompt',e=>{
    // Keep the Admin installation prompt for this Admin-specific UI.
    e.preventDefault();
    deferredPrompt=e;
    ensure();
  });

  window.addEventListener('appinstalled',()=>{
    installed=true;
    deferredPrompt=null;
    setButtonState();
  });

  function init(){
    if(initialized)return;
    initialized=true;
    addManifest();
    if(isAdminStandalone())installed=true;
    registerAdminWorker();
    ensure();
    setTimeout(ensure,250);
    setTimeout(ensure,1000);
    new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();