(function(){
'use strict';
let deferredPrompt=null;
let initialized=false;
const MANIFEST='/admin-pwa.webmanifest?v=admin-10';
const WORKER='/admin-service-worker.js?v=admin-8';
function standalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function manifest(){let l=document.querySelector('link[rel="manifest"][data-admin-pwa]');if(!l){l=document.createElement('link');l.rel='manifest';l.dataset.adminPwa='true';document.head.appendChild(l)}l.href=MANIFEST}
function button(){let b=document.getElementById('adminPwaInstall');const a=document.querySelector('.admin-header__actions');if(!b&&a){b=document.createElement('button');b.id='adminPwaInstall';b.type='button';b.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';b.setAttribute('aria-label','Install Admin App');b.title='Install Admin App';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';a.insertBefore(b,a.firstChild);b.addEventListener('click',install)}return b}
function state(){const b=button();if(!b)return;const done=standalone();b.hidden=done;b.disabled=false;b.classList.toggle('is-ready',!!deferredPrompt&&!done);b.setAttribute('aria-label',done?'Admin App Installed':'Install Admin App');b.title=done?'Admin App Installed':'Install Admin App'}
async function install(){if(standalone())return;if(deferredPrompt){const p=deferredPrompt;deferredPrompt=null;try{await p.prompt();await p.userChoice}catch(_){}state();return}window.location.href='/admin-install.html?source=admin'}
function init(){if(initialized)return;initialized=true;manifest();button();state();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;state()});window.addEventListener('appinstalled',()=>{deferredPrompt=null;state()});if('serviceWorker'in navigator)navigator.serviceWorker.register(WORKER,{scope:'/admin/'}).catch(()=>{});new MutationObserver(()=>{button();state()}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
