(function(){
  'use strict';
  let deferredPrompt=null;
  let installed=false;

  function isStandalone(){
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function addManifest(){
    let link=document.querySelector('link[rel="manifest"][data-admin-pwa]');
    if(!link){
      link=document.createElement('link');
      link.rel='manifest';
      link.href='/admin-pwa.webmanifest?v=admin-2';
      link.dataset.adminPwa='true';
      document.head.appendChild(link);
    }
  }

  function setButtonState(){
    const button=document.getElementById('adminPwaInstall');
    if(!button)return;
    button.hidden=false;
    button.disabled=false;
    button.setAttribute('aria-label',installed||isStandalone()?'Admin App Installed':'Install Admin App');
    button.title=installed||isStandalone()?'Admin App Installed':'Install Admin App';
    button.classList.toggle('is-installed',installed||isStandalone());
    button.innerHTML=installed||isStandalone()
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';
  }

  function addInstallEntry(){
    const actions=document.querySelector('.admin-header__actions');
    if(!actions || document.getElementById('adminPwaInstall'))return;
    const button=document.createElement('button');
    button.id='adminPwaInstall';
    button.type='button';
    button.className='admin-header__icon-button admin-pwa-install admin-header__tooltip';
    button.setAttribute('aria-label','Install Admin App');
    button.title='Install Admin App';
    button.addEventListener('click',install);
    actions.insertBefore(button,actions.firstChild);
    setButtonState();
  }

  function ensureEntry(){addInstallEntry();}

  async function install(){
    if(installed||isStandalone())return;
    if(deferredPrompt){
      deferredPrompt.prompt();
      const result=await deferredPrompt.userChoice.catch(()=>null);
      deferredPrompt=null;
      if(result?.outcome==='accepted'){
        installed=true;
        setButtonState();
      }
      return;
    }
    window.location.assign('/admin-install.html');
  }

  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    deferredPrompt=event;
    ensureEntry();
  });

  window.addEventListener('appinstalled',function(){
    installed=true;
    deferredPrompt=null;
    setButtonState();
  });

  function init(){
    addManifest();
    if(isStandalone())installed=true;
    ensureEntry();
    new MutationObserver(ensureEntry).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
