(function(){
  window.adminSession={
    login:async function(event){event.preventDefault();const username=document.getElementById('username')?.value.trim();const password=document.getElementById('password')?.value||'';const msg=document.getElementById('loginMsg');if(msg)msg.textContent='Signing in…';try{const r=await fetch('/api/admin/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Login failed.');if(msg)msg.textContent='';if(window.loadSiteContent)await window.loadSiteContent();if(window.loadAdminComments)window.loadAdminComments();const login=document.getElementById('login'),app=document.getElementById('app');if(login)login.classList.add('hidden');if(app)app.classList.remove('hidden');},
    logout:async function(){try{await fetch('/api/admin/logout',{method:'POST',credentials:'include'})}finally{location.reload()}},
    check:async function(){const status=document.getElementById('apiStatus');try{const r=await fetch('/api/admin/me',{credentials:'include'});if(!r.ok)throw new Error();if(status){status.textContent='API online';status.className='status ok'}const login=document.getElementById('login'),app=document.getElementById('app');if(login)login.classList.add('hidden');if(app)app.classList.remove('hidden');if(window.loadSiteContent)await window.loadSiteContent();if(window.loadAdminComments)window.loadAdminComments();}catch(e){if(status){status.textContent='API offline';status.className='status bad'}}}
  };
  window.login=function(event){return window.adminSession.login(event)};
  window.logout=function(){return window.adminSession.logout()};
  window.checkApi=function(){return window.adminSession.check()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.adminSession.check());else window.adminSession.check();
})();
