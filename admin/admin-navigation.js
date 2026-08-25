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
 .admin-section-mode .admin-view-stage{flex:1 1 auto;min-height:0;overflow:hidden}
 .admin-section-mode .admin-view-stage>.section,
 .admin-section-mode .admin-view-stage>#media,
 .admin-section-mode .admin-view-stage>#comments,
 .admin-section-mode .admin-view-stage>#adminRbac{height:100%;max-height:100%;overflow:auto;margin-bottom:0}
 .admin-section-mode .admin-view-stage>#site{height:100%;min-height:0;overflow:hidden}
 .admin-section-mode .admin-view-stage>#site>.section{height:100%;max-height:100%;overflow:auto;margin-bottom:0}
 .admin-section-mode .admin-view-stage>#site>.savebar{position:sticky;bottom:12px}
 .admin-section-mode .admin-view-stage>#site>.jump{display:none!important}
 `;
 document.head.appendChild(s);
 document.documentElement.classList.add('admin-section-mode');
}
function setHeaderHeight(){const h=document.querySelector('.admin-header')?.getBoundingClientRect().height||64;document.documentElement.style.setProperty('--admin-header-height',h+'px');}
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
 VIEWS.forEach(item=>{const [id,,view]=item;const button=nav.querySelector(`[data-view="${id}"]`);const target=getTarget(id);const allowed=permission(view);hide(button,!allowed);hide(target,!allowed);});
 const first=VIEWS.find(canView);if(first)showView(first[0]);
}
function showView(id){
 const item=VIEWS.find(v=>v[0]===id);if(!item||!permission(item[2]))return;
 const target=getTarget(id);if(!target)return;
 document.querySelectorAll('.admin-navigation [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 VIEWS.forEach(([viewId])=>hide(getTarget(viewId),viewId!==id));
 if(id==='site'){hide(target,false);const firstSite=VIEWS.slice(0,7).find(v=>permission(v[2]));if(firstSite&&document.getElementById(firstSite[0])){VIEWS.slice(0,7).forEach(([sid,,vp])=>hide(document.getElementById(sid),sid!==firstSite[0]||!permission(vp)));}}
 if(id==='media'&&typeof window.loadMedia==='function')window.loadMedia();
 if(id==='comments'&&typeof window.loadComments==='function')window.loadComments();
 if(id==='users'&&window.AdminRBAC?.loadUsers)window.AdminRBAC.loadUsers();
 window.scrollTo(0,0);
}
function init(){
 loadStyles();setHeaderHeight();buildNavigation();
 requestAnimationFrame(()=>{setHeaderHeight();applyPermissions();});
 window.addEventListener('resize',setHeaderHeight);
}
window.AdminNavigation={showView,applyVisibility:applyPermissions,updateOffsets:setHeaderHeight};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
