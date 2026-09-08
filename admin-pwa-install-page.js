(function(){
  'use strict';
  let deferredPrompt=null;
  const install=document.getElementById('install');
  const message=document.getElementById('message');
  const status=document.getElementById('status');
  const ADMIN_INSTALL_MARKER='kfcc-admin-pwa-installed';

  function hasAdminMarker(){try{return localStorage.getItem(ADMIN_INSTALL_MARKER)==='true'}catch(_){return false}}
  function isAdminInstalled(){
    const launchedAsAdminPwa=new URLSearchParams(location.search).get('source')==='pwa';
    if(launchedAsAdminPwa){try{localStorage.setItem(ADMIN_INSTALL_MARKER,'true')}catch(_){}return true}
    return hasAdminMarker();
  }
  function ready(){
    if(!install)return;
    if(isAdminInstalled()){
      message.textContent='The Admin App is already installed.';
      status.textContent='You can open the administration dashboard below.';
      install.classList.add('hidden');
      return;
    }
    install.classList.remove('hidden');
    message.textContent='Install the administration panel as a separate app. Your existing Church Website app will remain installed.';
  }

  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    deferredPrompt=event;
    ready();
  });

  install?.addEventListener('click',async function(){
    if(!deferredPrompt){
      status.textContent='The browser has not exposed the Admin App install prompt yet. Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.';
      return;
    }
    const prompt=deferredPrompt;
    deferredPrompt=null;
    prompt.prompt();
    const result=await prompt.userChoice.catch(()=>null);
    if(result?.outcome==='accepted'){
      try{localStorage.setItem(ADMIN_INSTALL_MARKER,'true')}catch(_){}
      message.textContent='Admin App installed successfully.';
      status.textContent='You can now open the Admin Panel from your device home screen.';
      install.classList.add('hidden');
    }else{
      status.textContent='Installation was cancelled. You can try again anytime.';
      ready();
    }
  });

  window.addEventListener('appinstalled',function(){
    deferredPrompt=null;
    try{localStorage.setItem(ADMIN_INSTALL_MARKER,'true')}catch(_){}
    message.textContent='Admin App installed successfully.';
    status.textContent='Open the Admin Panel from your device home screen.';
    install.classList.add('hidden');
  });

  ready();
})();
