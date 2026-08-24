(function(){
  const SITE_SECTIONS={identity:'site.view',about:'site.view',services:'site.view',links:'site.view',classes:'site.view',mediaSettings:'media.view',live:'live.view'};
  const EDIT_PERMISSIONS={identity:'site.edit',about:'site.edit',services:'site.edit',links:'site.edit',classes:'site.edit',mediaSettings:'media.edit',live:'live.edit'};
  function loadStyles(){if(document.querySelector('link[data-admin-navigation-css]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='/admin/admin-navigation.css';link.dataset.adminNavigationCss='true';document.head.appendChild(link);}
  function updateOffsets(){const header=document.querySelector('.admin-header'),tabs=document.querySelector('.admin-navigation');const h=header?Math.ceil(header.getBoundingClientRect().height):56;if(header)document.documentElement.style.setProperty('--admin-header-offset',h+'px');if(tabs)document.documentElement.style.setProperty('--admin-tabs-offset',Math.ceil(tabs.getBoundingClientRect().height)+'px');const main=document.querySelector('main');if(main)main.style.paddingTop=Math.max(22,h+22)+'px';}
  function permission(p){return window.AdminRBAC?.hasPermission?.(p)??false;}
  function setEditable(section,allowed){
    if(!section)return;
    section.querySelectorAll('input,textarea,select,button').forEach(control=>{
      if(control.closest('.head')||control.classList.contains('rbac-exempt'))return;
      control.disabled=!allowed;
      control.classList.toggle('rbac-disabled',!allowed);
    });
    section.querySelectorAll('[onclick*="addItem"],.savebar').forEach(control=>{control.classList.toggle('rbac-hidden',!allowed);});
  }
  function applySitePermissions(){
    const site=document.getElementById('site');
    if(!site)return;
    Object.entries(SITE_SECTIONS).forEach(([id,viewPermission])=>{
      const section=document.getElementById(id);if(!section)return;
      const canView=permission(viewPermission);const canEdit=permission(EDIT_PERMISSIONS[id]||viewPermission);
      section.classList.toggle('admin-view-hidden',!canView);
      setEditable(section,canEdit);
      const jump=site.querySelector(`.jump a[href="#${id}"]`);if(jump)jump.classList.toggle('rbac-hidden',!canView);
    });
    const savebar=site.querySelector('.savebar');if(savebar)savebar.classList.toggle('rbac-hidden',!permission('site.edit'));
    const theme=document.getElementById('theme');
    if(theme){const canView=permission('theme.view');const canEdit=permission('theme.edit');theme.classList.toggle('admin-view-hidden',!canView);theme.querySelectorAll('button[data-accent],#themeMode,#themeAccent').forEach(control=>{control.disabled=!canEdit;control.classList.toggle('rbac-disabled',!canEdit);});const themeJump=site.querySelector('.jump a[href="#theme"]');if(themeJump)themeJump.classList.toggle('rbac-hidden',!canView);}
  }
  function setSiteMode(mode){const site=document.getElementById('site');if(!site)return;site.classList.remove('admin-view-hidden');if(mode==='theme'){Object.keys(SITE_SECTIONS).forEach(id=>document.getElementById(id)?.classList.add('admin-view-hidden'));applySitePermissions();return;}applySitePermissions();document.getElementById('theme')?.classList.add('admin-view-hidden');}
  function views(){return{site:{el:document.getElementById('site'),permission:'site.view'},media:{el:document.getElementById('media'),permission:'media.view'},comments:{el:document.getElementById('comments'),permission:'comments.view'},theme:{el:document.getElementById('theme'),permission:'theme.view'},users:{el:document.getElementById('adminRbac'),permission:'users.view'}};}
  function showView(name,button){const all=views(),target=all[name];if(!target||!target.el||!permission(target.permission))return;Object.values(all).forEach(v=>{if(v.el)v.el.classList.add('admin-view-hidden');});if(name==='theme'){setSiteMode('theme');}else if(name==='site'){setSiteMode('site');}else{target.el.classList.remove('admin-view-hidden');}document.querySelectorAll('.admin-navigation [data-view]').forEach(b=>b.classList.toggle('active',b===button));if(name==='media'&&typeof window.loadMedia==='function')window.loadMedia();if(name==='comments'&&typeof window.loadComments==='function')window.loadComments();if(name==='users'&&window.AdminRBAC?.loadUsers)window.AdminRBAC.loadUsers();window.scrollTo({top:0,behavior:'smooth'});}
  function applyVisibility(){const nav=document.querySelector('.admin-navigation');if(!nav)return;nav.querySelectorAll('[data-view]').forEach(b=>{const allowed=permission(b.dataset.permission);b.classList.toggle('rbac-hidden',!allowed);b.disabled=!allowed;});const active=nav.querySelector('button.active:not(.rbac-hidden)')||nav.querySelector('button:not(.rbac-hidden)');if(active)showView(active.dataset.view,active);}
  function buildNavigation(){const existing=document.querySelector('.tabs');if(!existing)return;const nav=document.createElement('nav');nav.className='tabs admin-navigation';nav.setAttribute('aria-label','Admin sections');const items=[['site','Website Content','site.view'],['media','Media Library','media.view'],['comments','Live Comments','comments.view'],['theme','Theme','theme.view'],['users','Users & Permissions','users.view']];nav.innerHTML=items.map(([v,l,p])=>`<button type="button" data-view="${v}" data-permission="${p}">${l}</button>`).join('');existing.replaceWith(nav);nav.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view,b)));requestAnimationFrame(()=>{updateOffsets();applyVisibility();});if(window.ResizeObserver){const observer=new ResizeObserver(updateOffsets);const header=document.querySelector('.admin-header');if(header)observer.observe(header);observer.observe(nav);}window.addEventListener('resize',updateOffsets,{passive:true});}
  function init(){loadStyles();buildNavigation();}
  window.AdminNavigation={showView,applyVisibility,applySitePermissions,updateOffsets};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
