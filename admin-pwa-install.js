(function(){
  'use strict';
  let deferredPrompt = null;
  let installed = false;

  function isStandalone(){
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function ensureButton(){
    const actions = document.querySelector('.admin-header__actions');
    if(!actions || document.getElementById('adminPwaInstall')) return document.getElementById('adminPwaInstall');
    const button = document.createElement('button');
    button.id = 'adminPwaInstall';
    button.type = 'button';
    button.className = 'admin-header__icon-button admin-pwa-install admin-header__tooltip';
    button.setAttribute('aria-label','Install Admin App');
    button.title = 'Install Admin App';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>';
    button.addEventListener('click', install);
    actions.insertBefore(button, actions.firstChild);
    return button;
  }

  function setState(state){
    const button = ensureButton();
    if(!button) return;
    if(state === 'installed'){
      button.hidden = false;
      button.disabled = true;
      button.setAttribute('aria-label','Admin App Installed');
      button.title = 'Admin App Installed';
      button.classList.add('is-installed');
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>';
    }else{
      button.hidden = false;
      button.disabled = false;
      button.setAttribute('aria-label','Install Admin App');
      button.title = 'Install Admin App';
      button.classList.remove('is-installed');
    }
  }

  async function install(){
    if(installed || isStandalone()) return;
    if(deferredPrompt){
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice.catch(()=>null);
      if(result?.outcome === 'accepted') setState('installed');
      deferredPrompt = null;
      return;
    }
    alert('The browser has not made the Admin App install prompt available yet. On Android Chrome, open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.');
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredPrompt = event;
    setState('ready');
  });

  window.addEventListener('appinstalled', function(){
    installed = true;
    deferredPrompt = null;
    setState('installed');
  });

  function init(){
    if(isStandalone()){
      installed = true;
      setState('installed');
    }else{
      setState('ready');
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
