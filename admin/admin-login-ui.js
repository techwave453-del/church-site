(function(){
  'use strict';
  const FALLBACK_NAME='Church Administration';

  function loadStyles(){
    if(document.getElementById('adminLoginStyles'))return;
    const link=document.createElement('link');
    link.id='adminLoginStyles';
    link.rel='stylesheet';
    link.href='/admin/admin-login.css?v=3';
    document.head.appendChild(link);
  }

  function icon(type){
    if(type==='user')return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M8 15h.01M12 15h.01M16 15h.01"/></svg>';
  }

  function apply(){
    loadStyles();
    const login=document.getElementById('login');
    if(!login||login.dataset.loginUi==='v2')return;
    login.dataset.loginUi='v2';
    document.documentElement.classList.add('admin-login-ready');
    document.body.classList.add('admin-login-page');
    login.innerHTML=`
      <div class="login-hero">
        <div class="login-brand">
          <div class="login-logo-wrap"><div class="login-logo-fallback" aria-hidden="true">✦</div></div>
          <div><p class="login-kicker">Secure portal</p><p class="login-brand-name" data-login-brand>${FALLBACK_NAME}</p></div>
        </div>
        <h1>Welcome back.</h1>
        <p class="login-subtitle">Sign in to manage your church website, media, services and live ministry content.</p>
      </div>
      <div class="login-form-wrap">
        <form onsubmit="login(event)">
          <div class="login-field"><label for="username">Username</label><span class="login-field-icon">${icon('user')}</span><input id="username" autocomplete="username" placeholder="Enter your username" required></div>
          <div class="login-field"><label for="password">Password</label><span class="login-field-icon">${icon('lock')}</span><input id="password" type="password" autocomplete="current-password" placeholder="Enter your password" required></div>
          <button class="login-submit" type="submit">Sign in to Administration <span aria-hidden="true">→</span></button>
        </form>
        <p id="loginMsg" role="status" aria-live="polite"></p>
        <div class="login-footer"><span class="login-footer-dot"></span><span>Protected administrator access</span></div>
      </div>`;
  }

  window.applyAdminLoginUI=apply;

  window.refreshAdminLoginBranding=function(content){
    const data=content?.content||content||{};
    const name=data.churchName||data.church_name||data.name||data.site?.churchName||data.site?.church_name;
    if(name)document.querySelectorAll('[data-login-brand]').forEach(el=>el.textContent=String(name));
    const logo=data.logo||data.logoUrl||data.logo_url||data.site?.logo||data.site?.logoUrl;
    if(logo){
      const url=typeof logo==='string'?logo:(logo.url||logo.src||logo.publicUrl||logo.public_url||logo.path);
      if(url)document.querySelectorAll('.login-logo-wrap').forEach(el=>{el.innerHTML='<img class="login-logo" alt="" src="'+String(url).replace(/"/g,'&quot;')+'">';});
    }
  };

  // admin.html loads this after the login markup, so transform immediately.
  // Waiting for DOMContentLoaded caused the original login card to flash first.
  apply();
})();