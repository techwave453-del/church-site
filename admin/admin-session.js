(function(){
  const api=()=>window.adminApi||((url,options)=>fetch(url,{credentials:'include',...(options||{})}));
  async function loadAuthenticatedData(){
    if(window.loadSiteContent) await window.loadSiteContent();
    if(window.loadAdminComments) await window.loadAdminComments();
    if(window.loadMedia) await window.loadMedia();
  }
  function showApp(){
    document.getElementById('login')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
  }
  window.adminSession={
    login:async function(event){
      event?.preventDefault();
      const username=document.getElementById('username')?.value.trim()||'';
      const password=document.getElementById('password')?.value||'';
      const msg=document.getElementById('loginMsg');
      if(msg)msg.textContent='Signing in…';
      try{
        const r=await api()('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(data.error||'Login failed.');
        if(msg)msg.textContent='';
        showApp();
        await loadAuthenticatedData();
        if(window.loadAdminModules)await window.loadAdminModules();
        return true;
      }catch(error){
        if(msg)msg.textContent=error.message||'Login failed.';
        return false;
      }
    },
    logout:async function(){
      try{await api()('/api/admin/logout',{method:'POST'});}
      finally{location.reload();}
    },
    check:async function(){
      const status=document.getElementById('apiStatus');
      try{
        const r=await api()('/api/admin/session');
        if(!r.ok)throw new Error();
        if(status){status.textContent='API online';status.className='status ok';}
        showApp();
        await loadAuthenticatedData();
        return true;
      }catch(error){
        if(status){status.textContent='API offline';status.className='status bad';}
        return false;
      }
    }
  };
  window.login=event=>window.adminSession.login(event);
  window.logout=()=>window.adminSession.logout();
  window.checkApi=()=>window.adminSession.check();
  window.initAdminSession=()=>window.adminSession.check();
})();
