(function(){
  'use strict';
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
    addAccessLink();
    new MutationObserver(addAccessLink).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
