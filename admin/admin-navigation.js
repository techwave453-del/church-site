(function(){
  function loadStyles(){
    if(document.querySelector('link[data-admin-navigation-css]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-navigation.css';
    link.dataset.adminNavigationCss='true';
    document.head.appendChild(link);
  }
  function mountNavigation(){
    loadStyles();
    const existing=document.querySelector('.tabs');
    if(!existing)return;
    const nav=document.createElement('nav');
    nav.className='tabs admin-navigation';
    nav.setAttribute('aria-label','Admin sections');
    nav.innerHTML='<button class="active" type="button" data-tab="site">Website Content</button><button type="button" data-tab="media">Media Library</button><button type="button" data-tab="comments">Live Comments</button>';
    existing.replaceWith(nav);
    nav.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',function(){
      if(typeof window.tab==='function') window.tab(this.dataset.tab,this);
    }));
    requestAnimationFrame(function(){
      const header=document.querySelector('header');
      const tabs=document.querySelector('.tabs');
      if(header)document.documentElement.style.setProperty('--admin-header-offset',header.offsetHeight+'px');
      if(tabs)document.documentElement.style.setProperty('--admin-tabs-offset',tabs.offsetHeight+'px');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountNavigation);else mountNavigation();
})();
