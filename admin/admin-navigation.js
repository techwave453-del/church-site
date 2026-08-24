(function(){
  function loadStyles(){
    if(document.querySelector('link[data-admin-navigation-css]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-navigation.css';
    link.dataset.adminNavigationCss='true';
    document.head.appendChild(link);
  }

  function updateOffsets(){
    const header=document.querySelector('.admin-header');
    const tabs=document.querySelector('.admin-navigation');
    const headerHeight=header?Math.ceil(header.getBoundingClientRect().height):56;
    if(header)document.documentElement.style.setProperty('--admin-header-offset',headerHeight+'px');
    if(tabs)document.documentElement.style.setProperty('--admin-tabs-offset',Math.ceil(tabs.getBoundingClientRect().height)+'px');
    const main=document.querySelector('main');
    if(main)main.style.paddingTop=Math.max(22,headerHeight+22)+'px';
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
      if(typeof window.tab==='function')window.tab(this.dataset.tab,this);
    }));

    requestAnimationFrame(updateOffsets);
    if(window.ResizeObserver){
      const observer=new ResizeObserver(updateOffsets);
      const header=document.querySelector('.admin-header');
      if(header)observer.observe(header);
      observer.observe(nav);
    }
    window.addEventListener('resize',updateOffsets,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountNavigation);else mountNavigation();
})();
