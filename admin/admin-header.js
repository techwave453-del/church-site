(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;

  window.__ADMIN_BUILD_VERSION=Date.now().toString();

  if(!document.querySelector('link[data-admin-header-css]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-header.css?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION);
    link.dataset.adminHeaderCss='true';
    document.head.appendChild(link);
  }

  if(!document.querySelector('style[data-admin-savebar-mobile]')){
    const style=document.createElement('style');
    style.dataset.adminSavebarMobile='true';
    style.textContent='@media(max-width:650px){#site .savebar{position:fixed!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;width:auto!important;margin:0!important;z-index:1100!important;display:flex!important;align-items:stretch!important;flex-direction:column!important;gap:8px!important;padding:10px!important;background:#fff!important;border:1px solid #dfe4e8!important;border-radius:12px!important;box-shadow:0 8px 30px #0003!important}#site .savebar #saveState{display:block!important;width:100%!important;font-size:13px!important}#site .savebar .toolbar{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}#site .savebar .toolbar button{width:100%!important;min-height:44px!important}}';
    document.head.appendChild(style);
  }

  const stepIcons=[
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="7" cy="7" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="7" cy="17" r="1"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
  ];

  if(!document.getElementById('adminModuleLoading')){
    const loading=document.createElement('div');
    loading.id='adminModuleLoading';
    loading.hidden=false;
    loading.setAttribute('role','status');
    loading.setAttribute('aria-live','polite');
    loading.innerHTML='<div class="admin-module-loading-card">'+
      '<div class="admin-module-logo-placeholder" data-logo-placeholder aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v18M6 9l6-6 6 6M5 21h14M8 21V11h8v10"/><path d="M7 16h10"/></svg></div>'+
      '<img class="admin-module-logo" data-admin-logo alt="Kingdom Fellowship Christian Church logo">'+
      '<h1 class="admin-module-brand" data-admin-brand>Kingdom Fellowship Christian Church</h1>'+
      '<div class="admin-module-divider" aria-hidden="true"></div>'+
      '<p class="admin-module-tagline" data-admin-tagline>Revealing Christ to Nations</p>'+
      '<h2 class="admin-module-title" data-loading-text>Loading Administration…</h2>'+
      '<p class="admin-module-subtitle" data-loading-subtitle>Preparing your workspace</p>'+
      '<div class="admin-module-dots" aria-hidden="true"><span class="admin-module-dot active"></span><span class="admin-module-dot"></span><span class="admin-module-dot"></span><span class="admin-module-dot"></span></div>'+
      '<div class="admin-module-steps" aria-hidden="true">'+[0,1,2,3].map((i)=>'<div class="admin-module-step" data-loading-step="'+i+'"><span class="admin-module-step-icon">'+stepIcons[i]+'</span><span>'+['Connecting<br>to server…','Initializing<br>components…','Checking<br>permissions…','Almost ready…'][i]+'</span></div>').join('')+'</div>'+ 
      '<p class="admin-module-quote">“For God gives wisdom…” <span>James 1:5</span></p>'+
      '<p class="admin-module-error" data-loading-error hidden></p><button class="admin-module-retry" data-loading-retry type="button">Retry connection</button>'+ 
      '</div>';
    document.body.appendChild(loading);
  }

  function setLoadingStep(message){
    const text=document.querySelector('[data-loading-text]');
    const subtitle=document.querySelector('[data-loading-subtitle]');
    const dots=[...document.querySelectorAll('.admin-module-dot')];
    const steps=[...document.querySelectorAll('.admin-module-step')];
    const value=String(message||'Loading Administration…');
    const lower=value.toLowerCase();
    let index=0;
    if(lower.includes('access')||lower.includes('permission')||lower.includes('user access'))index=2;
    else if(lower.includes('permitted')||lower.includes('section')||lower.includes('components')||lower.includes('modules'))index=3;
    else if(lower.includes('initial')||lower.includes('admin panel'))index=1;
    if(lower.includes('finish loading')||lower.includes('unable'))index=3;
    if(text)text.textContent=value;
    if(subtitle)subtitle.textContent=index===0?'Connecting to the administration service':index===1?'Initializing your administration workspace':index===2?'Verifying your administrator permissions':'Preparing your permitted sections';
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===index);dot.classList.toggle('done',i<index)});
    steps.forEach((step,i)=>{step.classList.toggle('active',i===index);step.classList.toggle('done',i<index)});
  }
  window.setAdminLoadingState=setLoadingStep;

  window.loadAdminBranding=async function(){
    try{
      const [contentResponse,mediaResponse]=await Promise.all([
        fetch('/api/site/content',{credentials:'same-origin',cache:'no-store'}).catch(()=>null),
        fetch('/api/media',{credentials:'same-origin',cache:'no-store'}).catch(()=>null)
      ]);
      let content={};
      if(contentResponse?.ok)content=await contentResponse.json().catch(()=>({}));
      const logoCandidates=[];
      if(content.logoUrl)logoCandidates.push(content.logoUrl);
      if(content.logo)logoCandidates.push(content.logo);
      if(content.churchLogo)logoCandidates.push(content.churchLogo);
      if(mediaResponse?.ok){
        const items=await mediaResponse.json().catch(()=>[]);
        const logo=Array.isArray(items)?items.find(item=>item&&item.type==='image'&&String(item.category||'').toLowerCase()==='logo'):null;
        if(logo?.url)logoCandidates.unshift(logo.url);
      }
      const logoUrl=logoCandidates.find(Boolean);
      if(logoUrl){
        const img=document.querySelector('[data-admin-logo]');
        const placeholder=document.querySelector('[data-logo-placeholder]');
        if(img){img.onload=()=>{img.classList.add('is-ready');if(placeholder)placeholder.hidden=true};img.onerror=()=>{img.removeAttribute('src');img.classList.remove('is-ready');if(placeholder)placeholder.hidden=false};img.src=logoUrl}
      }
      const brand=document.querySelector('[data-admin-brand]');
      const tagline=document.querySelector('[data-admin-tagline]');
      if(brand&&content.churchName)brand.textContent=content.churchName;
      if(tagline&&content.tagline)tagline.textContent=content.tagline;
      if(content.fallbackImage){
        const loader=document.getElementById('adminModuleLoading');
        if(loader)loader.style.backgroundImage='url("'+String(content.fallbackImage).replace(/"/g,'\\"')+'")';
      }
      return {logoUrl,content};
    }catch(error){return {logoUrl:null,content:{}}}
  };
  loadAdminBranding();

  mount.innerHTML='<header class="admin-header"><strong class="admin-header__title">Kingdom Fellowship Christian Church — Admin</strong><div class="admin-header__actions"><span id="apiStatus" class="admin-header__status">Checking…</span><a class="secondary small admin-header__back" href="/" aria-label="Back to website">← Back to Website</a><button id="adminLogout" class="secondary small" type="button" onclick="logout()" hidden>Log out</button></div></header>';

  window.setAdminAuthenticatedUI=function(authenticated){
    const logoutButton=document.getElementById('adminLogout');
    if(logoutButton)logoutButton.hidden=!authenticated;
    document.body.classList.toggle('admin-authenticated',!!authenticated);
  };

  function installPasswordToggles(){
    document.querySelectorAll('input[type="password"]').forEach(input=>{
      if(input.dataset.passwordToggleReady==='true')return;
      input.dataset.passwordToggleReady='true';
      const wrapper=document.createElement('div');
      wrapper.className='admin-password-wrap';
      input.parentNode.insertBefore(wrapper,input);
      wrapper.appendChild(input);
      const button=document.createElement('button');
      button.type='button';
      button.className='admin-password-toggle';
      button.setAttribute('aria-label','Show password');
      button.setAttribute('aria-pressed','false');
      button.title='Show password';
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>';
      button.addEventListener('click',()=>{
        const showing=input.type==='text';
        input.type=showing?'password':'text';
        button.setAttribute('aria-label',showing?'Show password':'Hide password');
        button.setAttribute('aria-pressed',String(!showing));
        button.title=showing?'Show password':'Hide password';
        button.innerHTML=showing
          ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>'
          : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 3 18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.3 0 9.9 6 9.9 6a17.7 17.7 0 0 1-3.5 3.9M6.1 6.1C3.7 7.5 2.1 12 2.1 12s3.6 6 9.9 6c1.2 0 2.3-.2 3.3-.6"/><path d="M9.5 9.5a3.5 3.5 0 0 0 5 5"/></svg>';
      });
      if(!document.getElementById('admin-password-toggle-style')){
        const style=document.createElement('style');
        style.id='admin-password-toggle-style';
        style.textContent='.admin-password-wrap{position:relative;width:100%}.admin-password-wrap>input{padding-right:48px!important}.admin-password-toggle{position:absolute;right:7px;top:50%;transform:translateY(-50%);width:38px!important;height:38px!important;margin:0!important;padding:8px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#66717d!important;display:grid!important;place-items:center!important;cursor:pointer!important;box-shadow:none!important}.admin-password-toggle:hover{background:#eef2f5!important;color:#18202a!important}.admin-password-toggle:focus-visible{outline:2px solid #0b6bcb;outline-offset:1px}.admin-password-toggle svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}';
        document.head.appendChild(style);
      }
    });
  }
  installPasswordToggles();
  new MutationObserver(installPasswordToggles).observe(document.body,{childList:true,subtree:true});

  const load=()=>{
    const loader=document.createElement('script');
    loader.src='/admin/admin-loader.js?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION);
    loader.dataset.adminModule='admin-loader.js';
    loader.onload=function(){if(window.loadAdminModules)window.loadAdminModules().catch(e=>console.error(e));};
    loader.onerror=function(){
      const loading=document.getElementById('adminModuleLoading');
      if(loading){loading.hidden=false;setLoadingStep('Unable to load the admin loader. Please refresh and try again.');const error=loading.querySelector('[data-loading-error]');if(error){error.hidden=false;error.textContent='The administration modules could not be loaded.'}loading.querySelector('[data-loading-retry]')?.classList.add('show');}
      console.error('Failed to load admin module loader.');
    };
    document.head.appendChild(loader);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();
