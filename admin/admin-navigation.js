(function(){
'use strict';
const SITE_VIEWS=[
 ['identity','Church & Homepage','site.view','site.edit'],
 ['about','About the Church','site.view','site.edit'],
 ['services','Service Times','site.view','site.edit'],
 ['links','Homepage Links','site.view','site.edit'],
 ['classes','Membership Classes','site.view','site.edit'],
 ['mediaSettings','Media, Hero & Audio','media.view','media.edit'],
 ['live','Live Streaming','live.view','live.edit'],
 ['theme','Website Theme','theme.view','theme.edit']
];
const OTHER_VIEWS=[
 ['media','Media Library','media.view','media.edit'],
 ['comments','Live Comments','comments.view','comments.moderate'],
 ['users','Users & Permissions','users.view','users.edit']
];
const VIEWS=[...SITE_VIEWS,...OTHER_VIEWS];
function permission(p){return window.AdminRBAC?.hasPermission?.(p)??false;}
function hide(el,yes){if(el)el.classList.toggle('admin-view-hidden',!!yes);}
function loadStyles(){
 if(document.getElementById('admin-section-navigation-style'))return;
 const s=document.createElement('style');s.id='admin-section-navigation-style';
 s.textContent=`
 .admin-view-hidden{display:none!important}
 html.admin-section-mode,html.admin-section-mode body{height:100%;overflow:hidden}
 body.admin-section-mode main{height:calc(100vh - var(--admin-header-height,64px));overflow:hidden}
 .admin-section-mode #app{height:100%;display:flex;flex-direction:column;min-height:0}
 .admin-section-mode .admin-navigation{flex:0 0 auto;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:thin}
 .admin-section-mode #site,.admin-section-mode #media,.admin-section-mode #comments,.admin-section-mode #adminRbac{flex:1 1 auto;min-height:0;overflow:hidden}
 .admin-section-mode #site>.section{height:100%;max-height:100%;overflow:auto;margin-bottom:0}
 .admin-section-mode #site>.jump{display:none!important}
 .admin-section-mode #site>.savebar{position:sticky;bottom:12px;z-index:10}
 .admin-section-mode #media>section,.admin-section-mode #comments>section{max-height:100%;overflow:auto;margin-bottom:0}
 .admin-section-mode #adminRbac{overflow:auto}
 `;
 document.head.appendChild(s);
 document.documentElement.classList.add('admin-section-mode');
}
function setHeaderHeight(){const h=document.querySelector('.admin-header')?.getBoundingClientRect().height||64;document.documentElement.style.setProperty('--admin-header-height',h+'px');}
function siteTarget(id){return document.getElementById(id);}
function otherTarget(id){return document.getElementById(id==='users'?'adminRbac':id);}
function showView(id){
 const item=VIEWS.find(v=>v[0]===id);if(!item||!permission(item[2]))return;
 const isSite=SITE_VIEWS.some(v=>v[0]===id);
 document.querySelectorAll('.admin-navigation [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 // Hide all top-level containers first.
 hide(document.getElementById('media'),true);hide(document.getElementById('comments'),true);hide(document.getElementById('adminRbac'),true);
 const site=document.getElementById('site');
 if(isSite){
   hide(site,false);
   SITE_VIEWS.forEach(([sid,,view])=>hide(siteTarget(sid),sid!==id||!permission(view)));
 }else{
   hide(site,true);
   hide(otherTarget(id),false);
 }
 if(id==='media'&&typeof window.loadMedia==='function')window.loadMedia();
 if(id==='comments'&&typeof window.loadComments==='function')window.loadComments();
 if(id==='users'&&window.AdminRBAC?.loadUsers)window.AdminRBAC.loadUsers();
 window.scrollTo(0,0);
}
function applyPermissions(){
 const nav=document.querySelector('.admin-navigation');if(!nav)return;
 VIEWS.forEach(([id,,view])=>{const button=nav.querySelector(`[data-view="${id}"]`);hide(button,!permission(view));});
 const first=VIEWS.find(v=>permission(v[2]));if(first)showView(first[0]);
}
function buildNavigation(){
 const old=document.querySelector('.tabs');if(!old)return;
 const nav=document.createElement('nav');nav.className='tabs admin-navigation';nav.setAttribute('aria-label','Admin sections');
 nav.innerHTML=VIEWS.map(([id,label,view])=>`<button type="button" data-view="${id}" data-permission="${view}">${label}</button>`).join('');
 old.replaceWith(nav);
 nav.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
}
function init(){loadStyles();setHeaderHeight();buildNavigation();requestAnimationFrame(()=>{setHeaderHeight();applyPermissions();});window.addEventListener('resize',setHeaderHeight);}
window.AdminNavigation={showView,applyVisibility:applyPermissions,updateOffsets:setHeaderHeight};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
