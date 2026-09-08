(function(){
  'use strict';
  let deferredPrompt=null,installed=false,initialized=false;
  const ADMIN_MANIFEST='/admin-pwa.webmanifest?v=admin-7';
  const ADMIN_WORKER='/admin-service-worker.js?v=admin-5';
  const ADMIN_INSTALL_MARKER='kfcc-admin-pwa-installed';

  function launchedAsAdminPwa(){
    return new URLSearchParams(location.search).get('source')==='pwa';
  }
  function isStandalone(){
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
  }
  function button(){return document.getElementById('adminPwaInstall')}
  function addManifest(){
    let link=document.querySelector('link[rel="manifest"][data-admin-pwa]');
    if(!link){link=document.createElement('link');link.rel='manifest';link.dataset.adminPwa='true';document.head.appendChild(link)}
    link.href=ADMIN_MANIFEST;
  }
  function setButtonState(){
    const b=button();
    if(!b)return;
    const standalone=installed||isStandalone()||launchedAsAdminPwa();
    // Never hide the Admin install control merely because a stale local marker exists.
    // The website PWA has a different manifest, id and scope and must not affect this button.
    b.hidden=false;
    b.disabled=standalone;
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
    b.id='adminPwaInstall';b.type='button';
    b.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';
    b.setAttribute('aria-label','Install Admin App');b.title='Install Admin App';
    b.addEventListener('click',install);
    actions.insertBefore(b,actions.firstChild);
    setButtonState();
  }
  function ensure(){addInstallEntry();setButtonState()}
  async function install(){
    if(installed||isStandalone()||launchedAsAdminPwa())return;
    if(deferredPrompt){
      const prompt=deferredPrompt;deferredPrompt=null;
      await prompt.prompt();
      const result=await prompt.userChoice.catch(()=>null);
      if(result?.outcome==='accepted')installed=true;
      setButtonState();
      return;
    }
    // Keep the control usable even when Chromium has not exposed beforeinstallprompt.
    // The dedicated page explains the browser's manual install path and does not depend on
    // the public website's installation state.
    location.assign('/admin-install.html?source=admin');
  }
  async function registerAdminWorker(){
    if(!('serviceWorker' in navigator))return;
    try{await navigator.serviceWorker.register(ADMIN_WORKER,{scope:'/admin/'})}
    catch(error){console.warn('Admin PWA service worker registration failed:',error)}
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;ensure()});
  window.addEventListener('appinstalled',()=>{installed=true;deferredPrompt=null;setButtonState()});
  function init(){
    if(initialized)return;initialized=true;
    addManifest();
    // Do not use a persistent localStorage flag to decide whether the button is visible.
    // A flag can survive an uninstall and incorrectly make the Admin App look installed.
    try{localStorage.removeItem(ADMIN_INSTALL_MARKER)}catch(_){ }
    if(isStandalone()||launchedAsAdminPwa())installed=true;
    registerAdminWorker();
    ensure();
    setTimeout(ensure,250);setTimeout(ensure,1000);
    new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
