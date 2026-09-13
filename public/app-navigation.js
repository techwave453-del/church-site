(() => {
  const navItems = [['home','home','Home'],['live','live','Live'],['media','media','Media'],['give','give','Give'],['more','more','More']];
  const icons={
    home:'<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>',
    live:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
    media:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/></svg>',
    give:'<svg viewBox="0 0 24 24"><path d="M20.8 8.6c0 5.1-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9Z"/></svg>',
    more:'<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
  };
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const scrollToTarget=id=>{if(id==='more'){document.querySelector('.mobile-menu-trigger, .menuIcon')?.click();return}document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})};
  const updateActive=nav=>{const buttons=[...nav.querySelectorAll('[data-target]')];const sections=buttons.map(b=>document.getElementById(b.dataset.target)).filter(Boolean);const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;buttons.forEach(b=>b.classList.toggle('active',b.dataset.target===visible.target.id))},{rootMargin:'-25% 0px -55% 0px',threshold:[.1,.3,.6]});sections.forEach(s=>observer.observe(s))};
  const createNavigation=()=>{if(!isStandalone()||document.getElementById('kfcc-mobile-app-nav'))return;const nav=document.createElement('nav');nav.id='kfcc-mobile-app-nav';nav.setAttribute('aria-label','App navigation');nav.innerHTML=navItems.map(([target,icon,label])=>'<button type="button" data-target="'+target+'" aria-label="'+label+'"><span class="kfcc-app-nav-icon" aria-hidden="true">'+icons[icon]+'</span><span>'+label+'</span></button>').join('');nav.addEventListener('click',event=>{const button=event.target.closest('button[data-target]');if(!button)return;scrollToTarget(button.dataset.target);if(button.dataset.target!=='more'){nav.querySelectorAll('button').forEach(i=>i.classList.remove('active'));button.classList.add('active')}});document.body.appendChild(nav);nav.querySelector('[data-target="home"]')?.classList.add('active');updateActive(nav)};
  window.addEventListener('load',()=>window.setTimeout(createNavigation,250));
})();