(function(){
'use strict';
const VIEWS=[
 ['identity','Church & Homepage','site.view','site.edit'],['pages','Pages & Navigation','pages.view','pages.edit'],['about','About the Church','site.view','site.edit'],['services','Service Times','site.view','site.edit'],['links','Homepage Links','site.view','site.edit'],['classes','Membership Classes','site.view','site.edit'],['mediaSettings','Media, Hero & Audio','media.view','media.edit'],['live','Live Streaming','live.view','live.edit'],['theme','Website Theme','theme.view','theme.edit'],['media','Media Library','media.view','media.edit'],['comments','Live Comments','comments.view','comments.moderate'],['users','Users & Permissions','users.view','users.edit']
];
const SITE_IDS=new Set(['identity','pages','about','services','links','classes','mediaSettings','live','theme']);
const GROUPS=[{id:'content',label:'Website Content',items:['identity','pages','about','services','links','classes']},{id:'media',label:'Media',items:['mediaSettings','media']},{id:'live',label:'Live',items:['live','comments']},{id:'appearance',label:'Appearance',items:['theme']},{id:'admin',label:'Administration',items:['users']}];
function permission(p){const u=window.AdminRBAC?.getCurrentUser?.();if(u?.role==='super_admin')return true;return window.AdminRBAC?.hasPermission?.(p)??false;}
function hide(el,yes){if(!el)return;el.classList.toggle('admin-view-hidden',!!yes);el.classList.toggle('hidden',!!yes);}
function loadStyles(){if(document.getElementById('admin-section-navigation-style'))return;const s=document.createElement('style');s.id='admin-section-navigation-style';s.textContent=`
.admin-view-hidden{display:none!important}
html.admin-section-mode,html.admin-section-mode body{height:100%;overflow:hidden}
.admin-section-mode main{height:calc(100vh - var(--admin-header-height,56px));margin-top:var(--admin-header-height,56px);margin-bottom:0;overflow:hidden}
.admin-section-mode #app{height:100%;display:flex;flex-direction:column;min-height:0}
.admin-section-mode .admin-navigation{position:relative;top:auto;z-index:19;flex:0 0 auto;display:flex;align-items:center;gap:8px;overflow:visible;white-space:nowrap;padding:10px 0;margin-bottom:16px;background:var(--bg);box-shadow:0 4px 12px #0000000d}
.admin-section-mode .admin-menu{position:relative;flex:none}
.admin-section-mode .admin-menu-button{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.admin-section-mode .admin-menu-button::after{content:'▾';font-size:11px;opacity:.8}
.admin-section-mode .admin-menu-button.active-menu{background:var(--accent)}
.admin-section-mode .admin-menu-panel{position:absolute;left:0;top:calc(100% + 6px);min-width:220px;max-width:300px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:11px;box-shadow:0 12px 30px #0003;display:none;z-index:30}
.admin-section-mode .admin-menu.open .admin-menu-panel{display:grid;gap:3px}
.admin-section-mode .admin-menu-item{width:100%;text-align:left;background:transparent;color:var(--ink);font-weight:600;border-radius:8px;padding:9px 11px}
.admin-section-mode .admin-menu-item:hover,.admin-section-mode .admin-menu-item:focus-visible{background:#eef4fa;color:#075da8}
.admin-section-mode .admin-menu-item.selected{background:#e8f1fb;color:#075da8}
.admin-section-mode .admin-menu-toggle{display:none;margin-left:0}
.admin-section-mode .admin-mobile-label{display:none}
.admin-section-mode #site,.admin-section-mode #media,.admin-section-mode #comments,.admin-section-mode #adminRbac{flex:1 1 auto;min-height:0;overflow:hidden;margin-bottom:0}
.admin-section-mode #site{display:flex;flex-direction:column;min-height:0}
.admin-section-mode #site>.jump{display:none!important}
.admin-section-mode #site>.section{flex:1 1 auto;min-height:0;max-height:none;overflow:auto;margin-bottom:16px;scroll-margin-top:0}
.admin-section-mode #site>.savebar{flex:0 0 auto;position:relative;bottom:auto;margin-bottom:0}
.admin-section-mode #media,.admin-section-mode #comments,.admin-section-mode #adminRbac{overflow:auto}
.admin-section-mode #media>.card,.admin-section-mode #comments>.card{margin-bottom:16px}
.admin-section-mode #adminRbac{padding-bottom:8px}
.admin-no-permissions{display:flex;align-items:center;justify-content:center;min-height:220px;padding:24px;text-align:center}
.admin-no-permissions .card{width:min(620px,100%);padding:28px}
@media(max-width:700px){
.admin-section-mode .admin-navigation{display:block;padding:8px 0;margin-bottom:12px;box-shadow:0 3px 10px #0000000d}
.admin-section-mode .admin-menu{display:none;width:100%;padding:0}
.admin-section-mode .admin-navigation.mobile-menu-open .admin-menu{display:block;position:relative}
.admin-section-mode .admin-menu-button{display:none;width:100%;justify-content:space-between;text-align:left;margin:0 0 3px}
.admin-section-mode .admin-navigation.mobile-menu-open .admin-menu-button{display:flex}
.admin-section-mode .admin-menu-panel{position:relative;left:0;top:auto;width:100%;min-width:0;max-width:none;margin:0 0 6px;padding:4px;background:#fff;border:1px solid var(--line);border-radius:9px;box-shadow:none}
.admin-section-mode .admin-menu.open .admin-menu-panel{display:grid;gap:3px}
.admin-section-mode .admin-menu-toggle{display:inline-flex;align-items:center;gap:7px;background:var(--brand);padding:10px 13px;margin:0}
.admin-section-mode .admin-menu-toggle::before{content:'☰';font-size:18px;line-height:1}
.admin-section-mode .admin-mobile-label{display:inline;font-weight:700}
.admin-section-mode .admin-navigation.mobile-menu-open .admin-menu-toggle{margin-bottom:6px}
}
`;document.head.appendChild(s);document.documentElement.classList.add('admin-section-mode');}
function setHeaderHeight(){const h=document.querySelector('.admin-header')?.getBoundingClientRect().height||56;document.documentElement.style.setProperty('--admin-header-height',h+'px');}
function getTarget(id){return document.getElementById(id==='users'?'adminRbac':id);}
function getView(id){return VIEWS.find(v=>v[0]===id);}
function canView(id){const item=getView(id);return !!item&&permission(item[2]);}
function closeMenus(){document.querySelectorAll('.admin-menu.open').forEach(m=>{m.classList.remove('open');m.querySelector('.admin-menu-button')?.setAttribute('aria-expanded','false');});}
function showNoPermissions(){
 const nav=document.querySelector('.admin-navigation');
 if(nav)hide(nav,true);
 const site=document.getElementById('site');
 VIEWS.forEach(([id])=>hide(getTarget(id),true));
 hide(document.getElementById('media'),true);hide(document.getElementById('comments'),true);hide(document.getElementById('adminRbac'),true);
 let state=document.getElementById('adminNoPermissions');
 if(!state){state=document.createElement('div');state.id='adminNoPermissions';state.className='admin-no-permissions';state.innerHTML='<section class="card"><p>Your administrator account has been created, but no administration permissions have been assigned yet.</p></section>';site?.parentNode?.insertBefore(state,site);}
 hide(state,false);window.scrollTo(0,0);
}
function buildNavigation(){
 const old=document.querySelector('.tabs');if(!old)return;
 const nav=document.createElement('nav');nav.className='tabs admin-navigation';nav.setAttribute('aria-label','Admin sections');
 const toggle=document.createElement('button');toggle.type='button';toggle.className='admin-menu-toggle';toggle.setAttribute('aria-expanded','false');toggle.innerHTML='<span class="admin-mobile-label">Admin Menu</span>';nav.appendChild(toggle);
 GROUPS.forEach(group=>{
  const wrapper=document.createElement('div');wrapper.className='admin-menu';wrapper.dataset.group=group.id;
  const button=document.createElement('button');button.type='button';button.className='admin-menu-button';button.textContent=group.label;button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');
  const panel=document.createElement('div');panel.className='admin-menu-panel';panel.setAttribute('role','menu');
  group.items.forEach(id=>{const item=getView(id);if(!item)return;const child=document.createElement('button');child.type='button';child.className='admin-menu-item';child.dataset.view=id;child.dataset.permission=item[2];child.textContent=item[1];child.setAttribute('role','menuitem');child.addEventListener('click',()=>{showView(id);closeMenus();nav.classList.remove('mobile-menu-open');toggle.setAttribute('aria-expanded','false');});panel.appendChild(child);});
  button.addEventListener('click',()=>{const opening=!wrapper.classList.contains('open');closeMenus();wrapper.classList.toggle('open',opening);button.setAttribute('aria-expanded',String(opening));});
  wrapper.append(button,panel);nav.appendChild(wrapper);
 });
 toggle.addEventListener('click',()=>{const opening=!nav.classList.contains('mobile-menu-open');nav.classList.toggle('mobile-menu-open',opening);toggle.setAttribute('aria-expanded',String(opening));if(!opening)closeMenus();});
 old.replaceWith(nav);
 document.addEventListener('click',event=>{if(!nav.contains(event.target)){closeMenus();nav.classList.remove('mobile-menu-open');toggle.setAttribute('aria-expanded','false');}});
}
function applyPermissions(){
 const nav=document.querySelector('.admin-navigation');if(!nav)return;
 GROUPS.forEach(group=>{const wrapper=nav.querySelector(`[data-group="${group.id}"]`);if(!wrapper)return;let visible=0;group.items.forEach(id=>{const item=wrapper.querySelector(`[data-view="${id}"]`);const allowed=canView(id);hide(item,!allowed);if(allowed)visible++;});hide(wrapper,visible===0);});
 const first=GROUPS.flatMap(g=>g.items).find(canView);
 const empty=!first;
 hide(nav,empty);
 const state=document.getElementById('adminNoPermissions');
 if(empty){showNoPermissions();return;}
 hide(state,true);
 const current=document.querySelector('.admin-menu-item.selected')?.dataset.view;if(!current||!canView(current))showView(first);
}
function showView(id){const item=getView(id);if(!item||!permission(item[2]))return;const target=getTarget(id);if(!target)return;hide(document.getElementById('adminNoPermissions'),true);const nav=document.querySelector('.admin-navigation');hide(nav,false);nav?.querySelectorAll('.admin-menu-item').forEach(b=>b.classList.toggle('selected',b.dataset.view===id));const group=GROUPS.find(g=>g.items.includes(id));nav?.querySelectorAll('.admin-menu').forEach(m=>m.classList.toggle('active-menu',m.dataset.group===group?.id));const site=document.getElementById('site');hide(site,!SITE_IDS.has(id));VIEWS.filter(([viewId])=>SITE_IDS.has(viewId)).forEach(([viewId])=>hide(getTarget(viewId),viewId!==id));hide(document.getElementById('media'),id!=='media');hide(document.getElementById('comments'),id!=='comments');hide(document.getElementById('adminRbac'),id!=='users');if(id==='media'&&typeof window.loadMedia==='function')window.loadMedia();if(id==='comments'&&typeof window.loadComments==='function')window.loadComments();if(id==='users'&&window.AdminRBAC?.loadUsers)window.AdminRBAC.loadUsers();window.scrollTo(0,0);}
function init(){loadStyles();setHeaderHeight();buildNavigation();requestAnimationFrame(setHeaderHeight);window.addEventListener('resize',setHeaderHeight);}
window.AdminNavigation={showView,applyVisibility:applyPermissions,updateOffsets:setHeaderHeight};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
