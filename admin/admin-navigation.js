(function(){
'use strict';
const VIEWS=[
 ['identity','Church & Homepage','site.view','site.edit'],
 ['about','About the Church','site.view','site.edit'],
 ['services','Service Times','site.view','site.edit'],
 ['links','Homepage Links','site.view','site.edit'],
 ['classes','Membership Classes','site.view','site.edit'],
 ['mediaSettings','Media, Hero & Audio','media.view','media.edit'],
 ['live','Live Streaming','live.view','live.edit'],
 ['theme','Website Theme','theme.view','theme.edit'],
 ['media','Media Library','media.view','media.edit'],
 ['comments','Live Comments','comments.view','comments.moderate'],
 ['users','Users & Permissions','users.view','users.edit']
];
const SITE_IDS=new Set(['identity','about','services','links','classes','mediaSettings','live','theme']);
function permission(p){return window.AdminRBAC?.hasPermission?.(p)??false;}
function hide(el,yes){if(el)el.classList.toggle('admin-view-hidden',!!yes);}
function loadStyles(){
 if(document.getElementById('admin-section-navigation-style'))return;
 const s=document.createElement('style');s.id='admin-section-navigation-style';
 s.textContent=`
 .admin-view-hidden{display:none!important}
 html.admin-section-mode,html.admin-section-mode body{height:100%;overflow:hidden}
 .admin-section-mode main{height:calc(100vh - var(--admin-header-height,56px));margin-top:var(--admin-header-height,56px);margin-bottom:0;overflow:hidden}
 .admin-section-mode #app{height:100%;display:flex;flex-direction:column;min-height:0}
 .admin-section-mode .admin-navigation{position:relative;top:auto;z-index:2;flex:0 0 auto;display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;padding:10px 0;margin-bottom:16px;scrollbar-width:thin}
 .admin-section-mode .admin-navigation button{flex:none}
 .admin-section-mode #site,.admin-section-mode #media,.admin-section-mode #comments,.admin-section-mode #adminRbac{flex:1 1 auto;min-height:0;overflow:hidden;margin-bottom:0}
 .admin-section-mode #site{display:flex;flex-direction:column;min-height:0}
 .admin-section-mode #site>.jump{display:none!important}
 .admin-section-mode #site>.section{flex:1 1 auto;min-height:0;max-height:none;overflow:auto;margin-bottom:16px;scroll-margin-top:0}
 .admin-section-mode #site>.savebar{flex:0 0 auto;position:relative;bottom:auto;margin-bottom:0}
 .admin-section-mode #media,.admin-section-mode #comments,.admin-section-mode #adminRbac{overflow:auto}
 .admin-section-mode #media>.card,.admin-section-mode #comments>.card{margin-bottom:16px}
 .admin-section-mode #adminRbac{padding-bottom:8px}
 `;
 document.head.appendChild(s);
 document.documentElement.classList.add('admin-section-mode');
}
function setHeaderHeight(){const h=document.querySelector('.admin-header')?.getBoundingClientRect().height||56;document.documentElement.style.setProperty('--admin-header-height',h+'px');}
function getTarget(id){return document.getElementById(id==='users'?'adminRbac':id);}
function canView(item){return permission(item[2]);}
function buildNavigation(){
 const old=document.querySelector('.tabs');if(!old)return;
 const nav=document.createElement('nav');nav.className='tabs admin-navigation';nav.setAttribute('aria-label','Admin sections');
 nav.innerHTML=VIEWS.map(([id,label,view])=>`<button type="button" data-view="${id}" data-permission="${view}">${label}</button>`).join('');
 old.replaceWith(nav);
 nav.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
}
function applyPermissions(){
 const nav=document.querySelector('.admin-navigation');if(!nav)return;
 VIEWS.forEach(([id,,view])=>hide(nav.querySelector(`[data-view="${id}"]`),!permission(view)));
 const first=VIEWS.find(canView);if(first)showView(first[0]);
}
function showView(id){
 const item=VIEWS.find(v=>v[0]===id);if(!item||!permission(item[2]))return;
 const target=getTarget(id);if(!target)return;
 document.querySelectorAll('.admin-navigation [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 const site= document.getElementById('site');
 hide(site,!SITE_IDS.has(id));
 VIEWS.filter(([viewId])=>SITE_IDS.has(viewId)).forEach(([viewId])=>hide(getTarget(viewId),viewId!==id));
 hide(document.getElementById('media'),id!=='media');
 hide(document.getElementById('comments'),id!=='comments');
 hide(document.getElementById('adminRbac'),id!=='users');
 if(id==='media'&&typeof window.loadMedia==='function')window.loadMedia();
 if(id==='comments'&&typeof window.loadComments==='function')window.loadComments();
 if(id==='users'&&window.AdminRBAC?.loadUsers)window.AdminRBAC.loadUsers();
}
function init(){
 loadStyles();setHeaderHeight();buildNavigation();
 requestAnimationFrame(()=>{setHeaderHeight();if(window.AdminRBAC)applyPermissions();});
 window.addEventListener('resize',setHeaderHeight);
}
window.AdminNavigation={showView,applyVisibility:applyPermissions,updateOffsets:setHeaderHeight};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
