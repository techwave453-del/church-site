(function(){
  const api=()=>window.adminApi||((url,options)=>fetch(url,{credentials:'include',...(options||{})}));

  function setAuthenticatedUI(authenticated){
    if(typeof window.setAdminAuthenticatedUI==='function')window.setAdminAuthenticatedUI(!!authenticated);
  }

  function showSetup(username=''){
    const value=String(username||'').trim();
    const target=value
      ? `/admin/admin-access.html?username=${encodeURIComponent(value)}`
      : '/admin/admin-access.html';
    window.location.assign(target);
  }

  function installSetupLink(){
    const password=document.getElementById('password');
    if(password)password.required=false;
    const login=document.getElementById('login');
    if(login&&!document.getElementById('firstSetupLink')){
      const p=document.createElement('p');
      p.innerHTML='<button type="button" class="secondary small" id="firstSetupLink">Request administrator access</button>';
      login.appendChild(p);
      p.querySelector('button').onclick=()=>showSetup(document.getElementById('username')?.value.trim()||'');
    }
  }

  function showApp(){
    document.getElementById('login')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    setAuthenticatedUI(true);
  }

  function showLogin(){
    document.getElementById('app')?.classList.add('hidden');
    document.getElementById('login')?.classList.remove('hidden');
    setAuthenticatedUI(false);
  }

  async function startAdmin(){
    if(window.__adminModulesStarting)return window.__adminModulesStarting;
    window.__adminModulesStarting=window.loadAdminModules?window.loadAdminModules():Promise.resolve(false);
    try{return await window.__adminModulesStarting;}
    finally{window.__adminModulesStarting=null;}
  }

  window.adminSession={
    login:async function(event){
      event?.preventDefault();
      const username=document.getElementById('username')?.value.trim()||'';
      const password=document.getElementById('password')?.value||'';
      const msg=document.getElementById('loginMsg');
      if(msg)msg.textContent='Signing in…';
      setAuthenticatedUI(false);

      if(!password&&username){showSetup(username);return false;}

      try{
        const r=await api()('/api/admin/login',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({username,password})
        });
        const data=await r.json().catch(()=>({}));
        if(!r.ok){
          if(data.requiresPasswordSetup){showSetup(username);return false;}
          throw new Error(data.error||'Login failed.');
        }
        if(msg)msg.textContent='Loading admin panel…';
        const ready=await startAdmin();
        if(!ready)throw new Error('The admin panel could not finish loading. Please try again.');
        showApp();
        return true;
      }catch(error){
        setAuthenticatedUI(false);
        showLogin();
        if(msg)msg.textContent=error.message||'Login failed.';
        return false;
      }
    },

    logout:async function(){
      setAuthenticatedUI(false);
      try{await api()('/api/admin/logout',{method:'POST'});}
      finally{location.reload();}
    },

    check:async function(){
      const status=document.getElementById('apiStatus');
      try{
        const r=await api()('/api/admin/session',{cache:'no-store'});
        if(!r.ok)throw new Error();
        const data=await r.json().catch(()=>({}));
        if(data.user?.password_setup_only)throw new Error('setup');
        if(status){status.textContent='API online';status.className='status ok';}
        showApp();
        return true;
      }catch(error){
        setAuthenticatedUI(false);
        showLogin();
        if(status){status.textContent='API offline';status.className='status bad';}
        return false;
      }
    }
  };

  window.login=event=>window.adminSession.login(event);
  window.logout=()=>window.adminSession.logout();
  window.checkApi=()=>window.adminSession.check();
  window.initAdminSession=()=>window.adminSession.check();
  installSetupLink();
  showLogin();
})();