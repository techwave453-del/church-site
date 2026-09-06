(function(){
  'use strict';
  let deferredPrompt=null;
  const install=document.getElementById('install');
  const message=document.getElementById('message');
  const status=document.getElementById('status');

  function standalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;}
  function ready(){
    if(!install)return;
    if(standalone()){
      message.textContent='The Admin App is already running as an installed app.';
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
      status.textContent='The browser has not exposed the install prompt yet. Open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.';
      return;
    }
    deferredPrompt.prompt();
    const result=await deferredPrompt.userChoice.catch(()=>null);
    deferredPrompt=null;
    if(result?.outcome==='accepted'){
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
    message.textContent='Admin App installed successfully.';
    status.textContent='Open the Admin Panel from your device home screen.';
    install.classList.add('hidden');
  });

  ready();
})();
