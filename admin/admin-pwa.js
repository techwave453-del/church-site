(function(){
  'use strict';
  let deferredPrompt=null,installed=false,initialized=false,refreshing=false;
  const ADMIN_MANIFEST='/admin-pwa.webmanifest?v=admin-8';
  const ADMIN_WORKER='/admin-service-worker.js?v=admin-6';
  const ADMIN_INSTALL_MARKER='kfcc-admin-pwa-installed';
  const VERSION_KEY='kfcc-admin-build-version';

  function launchedAsAdminPwa(){return new URLSearchParams(location.search).get('source')==='pwa';}
  function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;}
  function button(){return document.getElementById('adminPwaInstall')}
  function addManifest(){let link=document.querySelector('link[rel="manifest"][data-admin-pwa]');if(!link){link=document.createElement('link');link.rel='manifest';link.dataset.adminPwa='true';document.head.appendChild(link)}link.href=ADMIN_MANIFEST;}
  function setButtonState(){const b=button();if(!b)return;const standalone=installed||isStandalone()||launchedAsAdminPwa();b.hidden=false;b.disabled=standalone;b.dataset.installReady=deferredPrompt?'true':'false';b.setAttribute('aria-label',standalone?'Admin App Installed':'Install Admin App');b.title=standalone?'Admin App Installed':'Install Admin App';b.classList.toggle('is-installed',standalone);b.classList.toggle('is-ready',!!deferredPrompt&&!standalone);b.innerHTML=standalone?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';}
  function addInstallEntry(){const actions=document.querySelector('.admin-header__actions');if(!actions||button())return;const b=document.createElement('button');b.id='adminPwaInstall';b.type='button';b.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';b.setAttribute('aria-label','Install Admin App');b.title='Install Admin App';b.addEventListener('click',install);actions.insertBefore(b,actions.firstChild);setButtonState();}
  function ensure(){addInstallEntry();setButtonState()}
  async function install(){if(installed||isStandalone()||launchedAsAdminPwa())return;if(deferredPrompt){const prompt=deferredPrompt;deferredPrompt=null;await prompt.prompt();const result=await prompt.userChoice.catch(()=>null);if(result?.outcome==='accepted')installed=true;setButtonState();return;}location.assign('/admin-install.html?source=admin');}
  async function checkDeploymentVersion(){try{const response=await fetch(`/build-version.json?ts=${Date.now()}`,{cache:'no-store',credentials:'same-origin'});if(!response.ok)return;const data=await response.json();if(!data?.version)return;const previous=localStorage.getItem(VERSION_KEY);localStorage.setItem(VERSION_KEY,data.version);if(previous&&previous!==data.version&&!sessionStorage.getItem('kfcc-admin-auto-updated')){sessionStorage.setItem('kfcc-admin-auto-updated','1');window.location.reload();}}catch(_){} }
  async function registerAdminWorker(){if(!('serviceWorker' in navigator))return;try{const registration=await navigator.serviceWorker.register(ADMIN_WORKER,{scope:'/admin/'});registration.addEventListener('updatefound',()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'});});});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;window.location.reload();}});registration.update().catch(()=>{});}catch(error){console.warn('Admin PWA service worker registration failed:',error);}}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;ensure()});
  window.addEventListener('appinstalled',()=>{installed=true;deferredPrompt=null;setButtonState()});
  async function init(){if(initialized)return;initialized=true;addManifest();try{localStorage.removeItem(ADMIN_INSTALL_MARKER)}catch(_){}if(isStandalone()||launchedAsAdminPwa())installed=true;await checkDeploymentVersion();registerAdminWorker();ensure();setTimeout(ensure,250);setTimeout(ensure,1000);new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
