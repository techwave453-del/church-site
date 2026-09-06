(function(){
'use strict';

let deferredPrompt=null;
let modal=null;
let verified=false;

function addManifest(){
  if(document.querySelector('link[data-admin-pwa-manifest]'))return;
  const link=document.createElement('link');
  link.rel='manifest';
  link.href='/admin/admin-pwa.webmanifest';
  link.dataset.adminPwaManifest='true';
  document.head.appendChild(link);
}

function styles(){
  if(document.getElementById('admin-pwa-style'))return;
  const s=document.createElement('style');
  s.id='admin-pwa-style';
  s.textContent=`
  .admin-pwa-install{display:none;align-items:center;gap:7px;border:1px solid color-mix(in srgb,var(--line,#d9e2ec) 80%,transparent);background:var(--card,#fff);color:var(--ink,#173b67);border-radius:9px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 2px 8px #0000000d}
  .admin-pwa-install.show{display:inline-flex}
  .admin-pwa-modal-backdrop{position:fixed;inset:0;background:#07152699;display:grid;place-items:center;padding:18px;z-index:10050;backdrop-filter:blur(5px)}
  .admin-pwa-modal{width:min(520px,100%);background:#fff;color:#17212b;border-radius:18px;box-shadow:0 24px 70px #0005;overflow:hidden}
  .admin-pwa-head{padding:22px 24px 16px;background:linear-gradient(135deg,#173b67,#245f93);color:#fff}
  .admin-pwa-head h2{margin:0 0 5px;font-size:21px}.admin-pwa-head p{margin:0;opacity:.86;font-size:13px}
  .admin-pwa-body{padding:20px 24px}.admin-pwa-step{display:flex;gap:13px;padding:13px 0;border-bottom:1px solid #e8edf2}.admin-pwa-step:last-child{border-bottom:0}.admin-pwa-number{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#e9f1f9;color:#173b67;font-weight:800;flex:none}.admin-pwa-step.done .admin-pwa-number{background:#173b67;color:#fff}.admin-pwa-step strong{display:block;margin-bottom:3px}.admin-pwa-step span{font-size:13px;color:#64717d}.admin-pwa-status{margin-top:12px;padding:10px 12px;border-radius:9px;background:#f3f6f9;font-size:13px}.admin-pwa-actions{display:flex;justify-content:flex-end;gap:9px;padding:0 24px 22px}.admin-pwa-actions button{border:0;border-radius:9px;padding:10px 15px;font:inherit;font-weight:700;cursor:pointer}.admin-pwa-cancel{background:#edf1f5;color:#263746}.admin-pwa-confirm{background:#173b67;color:#fff}.admin-pwa-confirm:disabled{opacity:.45;cursor:not-allowed}
  @media(max-width:700px){.admin-pwa-install{width:100%;justify-content:center}.admin-pwa-body{padding:17px}.admin-pwa-actions{padding:0 17px 18px}}
  `;
  document.head.appendChild(s);
}

function button(){
  if(document.getElementById('adminPwaInstall'))return document.getElementById('adminPwaInstall');
  const b=document.createElement('button');
  b.id='adminPwaInstall';b.className='admin-pwa-install';b.type='button';b.textContent='Install Admin App';
  b.title='Install the administration panel as an app';
  b.addEventListener('click',openVerification);
  const actions=document.querySelector('.admin-header__actions')||document.querySelector('.admin-header');
  actions?.prepend(b);
  return b;
}

async function verifySession(){
  try{
    const response=await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store'});
    if(!response.ok)return false;
    const data=await response.json();
    const user=data.user;
    return !!user && (user.role==='super_admin' || Array.isArray(user.permissions));
  }catch{return false;}
}

function openVerification(){
  if(modal)return;
  modal=document.createElement('div');
  modal.className='admin-pwa-modal-backdrop';
  modal.innerHTML=`<section class="admin-pwa-modal" role="dialog" aria-modal="true" aria-labelledby="adminPwaTitle">
    <header class="admin-pwa-head"><h2 id="adminPwaTitle">Install Admin App</h2><p>A quick security check before this administrator panel is installed.</p></header>
    <div class="admin-pwa-body">
      <div class="admin-pwa-step" data-step="1"><div class="admin-pwa-number">1</div><div><strong>Verify administrator session</strong><span>Confirm that this browser is currently signed in to an administrator account.</span></div></div>
      <div class="admin-pwa-step" data-step="2"><div class="admin-pwa-number">2</div><div><strong>Verify administration access</strong><span>Confirm that the signed-in account has an assigned administration role or permission set.</span></div></div>
      <div class="admin-pwa-step" data-step="3"><div class="admin-pwa-number">3</div><div><strong>Confirm installation</strong><span>The browser will show its native installation prompt. Your credentials are never requested here.</span></div></div>
      <div class="admin-pwa-status" data-pwa-status>Checking your administrator session…</div>
    </div>
    <div class="admin-pwa-actions"><button class="admin-pwa-cancel" type="button">Cancel</button><button class="admin-pwa-confirm" type="button" disabled>Verify & Install</button></div>
  </section>`;
  document.body.appendChild(modal);
  const status=modal.querySelector('[data-pwa-status]');
  const confirm=modal.querySelector('.admin-pwa-confirm');
  modal.querySelector('.admin-pwa-cancel').onclick=close;
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  verifySession().then(ok=>{
    if(!modal)return;
    const step=modal.querySelector('[data-step="1"]');
    if(ok){step.classList.add('done');status.textContent='Administrator session verified. Access permissions confirmed.';modal.querySelector('[data-step="2"]').classList.add('done');verified=true;confirm.disabled=!deferredPrompt;}
    else {status.textContent='Verification failed. Please sign in again before installing the Admin App.';verified=false;}
  });
  confirm.onclick=install;
}

async function install(){
  if(!verified||!deferredPrompt)return;
  const prompt=deferredPrompt;
  deferredPrompt=null;
  const confirm=modal?.querySelector('.admin-pwa-confirm');
  if(confirm)confirm.disabled=true;
  try{
    await prompt.prompt();
    await prompt.userChoice;
    close();
  }catch(error){
    const status=modal?.querySelector('[data-pwa-status]');
    if(status)status.textContent='Installation could not be started. You can try again from the Install Admin App button.';
  }
}

function close(){modal?.remove();modal=null;verified=false}

function updateButton(){
  const b=button();
  if(!b)return;
  const installed=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  b.classList.toggle('show',!installed&&!!deferredPrompt);
}

async function register(){
  addManifest();styles();button();
  if('serviceWorker' in navigator){
    try{await navigator.serviceWorker.register('/admin/admin-service-worker.js',{scope:'/admin/'});}catch(error){console.warn('Admin PWA service worker registration failed:',error);}
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;updateButton();});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;updateButton();close();});
  updateButton();
}

window.AdminPWA={openInstall:openVerification,refresh:updateButton};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',register);else register();
})();
