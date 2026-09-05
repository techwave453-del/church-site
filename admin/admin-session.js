(function(){
  const api=()=>window.adminApi||((url,options)=>fetch(url,{credentials:'include',...(options||{})}));

  function installLoginDesign(){
    document.body.classList.add('admin-login-page');
    if(!document.getElementById('adminLoginStyles')){
      const link=document.createElement('link');link.id='adminLoginStyles';link.rel='stylesheet';link.href='/admin/admin-login.css?v=1';document.head.appendChild(link);
    }
    const login=document.getElementById('login');
    if(!login||login.dataset.redesigned==='1')return;
    login.dataset.redesigned='1';
    const form=login.querySelector('form');
    if(!form)return;
    const heading=login.querySelector('h1');
    const intro=login.querySelector('.muted');
    const hero=document.createElement('div');hero.className='login-hero';
    const brand=document.createElement('div');brand.className='login-brand';
    const fallback=document.createElement('div');fallback.className='login-logo-fallback';fallback.textContent='✦';
    brand.appendChild(fallback);
    const brandText=document.createElement('div');
    brandText.innerHTML='<p class="login-kicker">Administration</p><p class="login-brand-name">Kingdom Fellowship Christian Church</p>';
    brand.appendChild(brandText);hero.appendChild(brand);
    if(heading){heading.textContent='Welcome back';hero.appendChild(heading)}
    if(intro){intro.className='login-subtitle';intro.textContent='Sign in securely to manage your church website, media and live ministry.';hero.appendChild(intro)}
    login.insertBefore(hero,login.firstChild);
    const wrap=document.createElement('div');wrap.className='login-form-wrap';
    while(form.firstChild){
      const node=form.firstChild;
      if(node.nodeType===1&&node.tagName==='LABEL'){
        const field=document.createElement('div');field.className='login-field';
        const label=node;const input=node.nextElementSibling;
        field.appendChild(label);field.appendChild(input);
        const icon=document.createElement('span');icon.className='login-field-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=input?.id==='username'?'◉':'▣';field.appendChild(icon);
        wrap.appendChild(field);continue;
      }
      wrap.appendChild(node);
    }
    form.parentNode.insertBefore(wrap,form);wrap.appendChild(form);
    form.className='admin-login-form';
    const toolbar=form.querySelector('.toolbar');
    if(toolbar){toolbar.className='login-actions';const button=toolbar.querySelector('button');if(button){button.className='login-submit';button.textContent='Sign in to Administration';}}
    const footer=document.createElement('div');footer.className='login-footer';footer.innerHTML='<span class="login-footer-dot"></span><span>Secure administrator access</span>';
    wrap.appendChild(footer);
    const password=document.getElementById('password');
    if(password)password.required=false;
  }

  function setAuthenticatedUI(authenticated){
    if(typeof window.setAdminAuthenticatedUI==='function')window.setAdminAuthenticatedUI(!!authenticated);
    document.body.classList.toggle('admin-login-page',!authenticated);
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
    installLoginDesign();
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