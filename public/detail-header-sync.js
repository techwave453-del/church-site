(function(){
  const isDesktop=()=>window.matchMedia('(min-width:701px)').matches;
  const labels={Home:'Home',About:'About',Events:'Events', 'Visit Us':'Visit Us',Media:'Media',Resources:'Resources',Give:'Give',Contact:'Contact'};
  const routes={About:'visit-us',Events:'upcoming-programs','Visit Us':'visit-us',Media:'media',Resources:'resources',Give:'give',Contact:'contact'};
  function install(){
    if(!isDesktop()) return;
    const old=document.querySelector('.detailPage .detailHeader');
    if(!old||document.querySelector('.detailPage .detailSiteHeader')) return;
    const page=old.closest('.detailPage');
    const brand=old.querySelector('.detailBrand');
    const name=brand?.querySelector('strong')?.textContent||'Kingdom Fellowship Christian Church';
    const tagline=brand?.querySelector('span')?.textContent||'Revealing Christ to Nations';
    const header=document.createElement('header');
    header.className='detailSiteHeader';
    const identity=document.createElement('button');
    identity.className='brand';
    identity.type='button';
    identity.setAttribute('aria-label',name+' home');
    identity.onclick=()=>{window.location.href='/#home'};
    const logo=document.createElement('img');
    logo.className='brandLogo';
    logo.alt='';
    logo.src='/logo.png';
    logo.onerror=()=>logo.remove();
    identity.appendChild(logo);
    const text=document.createElement('span');
    const b=document.createElement('b'); b.textContent=name;
    const small=document.createElement('small'); small.textContent=tagline;
    text.append(b,small); identity.appendChild(text);
    const nav=document.createElement('nav');
    nav.className='navLinks'; nav.setAttribute('aria-label','Main navigation');
    Object.keys(labels).forEach(label=>{
      const a=document.createElement('a');
      a.textContent=labels[label];
      a.href=label==='Home'?'/#home':'/#detail/'+routes[label];
      nav.appendChild(a);
    });
    const actions=document.createElement('div'); actions.style.cssText='display:flex;align-items:center;gap:8px';
    const menu=document.createElement('button'); menu.className='icon menuIcon'; menu.setAttribute('aria-label','Open menu'); menu.innerHTML='<span style="font-size:22px">☰</span>'; actions.appendChild(menu);
    const search=document.createElement('button'); search.className='icon'; search.setAttribute('aria-label','Search'); search.innerHTML='<span style="font-size:20px">⌕</span>'; actions.appendChild(search);
    header.append(identity,nav,actions);
    old.replaceWith(header);
    page.classList.add('detail-home-header');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
