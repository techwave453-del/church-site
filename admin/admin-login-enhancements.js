(function(){
  'use strict';
  function addMobileStyles(){
    if(document.getElementById('adminLoginMobileStyles'))return;
    const link=document.createElement('link');
    link.id='adminLoginMobileStyles';
    link.rel='stylesheet';
    link.href='/admin/admin-login-mobile.css?v=1';
    document.head.appendChild(link);
  }
  function addAccessLink(){
    const form=document.querySelector('#login .login-form-wrap form');
    if(!form||document.getElementById('firstSetupLink'))return;
    const link=document.createElement('a');
    link.id='firstSetupLink';
    link.className='login-access-link';
    link.href='/admin/admin-access.html';
    link.textContent='Request administrator access';
    link.setAttribute('aria-label','Request administrator access');
    form.insertAdjacentElement('afterend',link);
  }
  function init(){
    addMobileStyles();
    addAccessLink();
    new MutationObserver(()=>{addMobileStyles();addAccessLink()}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
