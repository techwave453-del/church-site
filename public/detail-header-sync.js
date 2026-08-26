(function(){
  const isDesktop=()=>window.matchMedia('(min-width:701px)').matches;
  const labels={Home:'Home',About:'About',Events:'Events','Visit Us':'Visit Us',Media:'Media',Resources:'Resources',Give:'Give',Contact:'Contact'};
  const routes={About:'visit-us',Events:'upcoming-programs','Visit Us':'visit-us',Media:'media',Resources:'resources',Give:'give',Contact:'contact'};
  const slug=v=>String(v||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let siteData=null;
  async function loadSite(){if(siteData)return siteData;try{const r=await fetch('/api/site/content');siteData=r.ok?await r.json():{};}catch(_e){siteData={}}return siteData||{}}
  async function applyDetailHero(){
    const hero=document.querySelector('.detailPage .detailHero');
    if(!hero)return;
    const title=hero.querySelector('h1')?.textContent||'';
    const key=slug(title);
    hero.classList.add(`detailHero--${key}`);
    if(hero.dataset.heroApplied)return;
    hero.dataset.heroApplied='1';
    const data=await loadSite();
    const saved=data?.detailContent?.[key]||data?.detailContent?.[title]||{};
    let image=String(saved?.heroImage||saved?.image||'').trim();
    try{
      const r=await fetch('/api/media');const items=r.ok?await r.json():[];
      const images=(Array.isArray(items)?items:[]).filter(x=>x?.type==='image'&&x?.url);
      if(!image){const tokens=key.split('-').filter(x=>x.length>2);const ranked=images.map(x=>{const text=slug(`${x.title||''} ${x.description||''} ${x.category||''}`);const score=tokens.filter(t=>text.includes(t)).length;return {...x,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);image=ranked[0]?.url||'';}
      if(!image)image=images.find(x=>['general','gallery','resources'].includes(String(x.category||'').toLowerCase()))?.url||'';
    }catch(_e){}
    if(image){hero.classList.add('detailHeroImage');hero.style.setProperty('--detail-hero-image',`url(${JSON.stringify(image)})`)}
  }
  async function install(){
    if(!isDesktop())return;
    const old=document.querySelector('.detailPage .detailHeader');
    if(old&&!document.querySelector('.detailPage .detailSiteHeader')){
      const page=old.closest('.detailPage');const brand=old.querySelector('.detailBrand');const data=await loadSite();
      const name=data?.name||data?.churchName||brand?.querySelector('strong')?.textContent||'Kingdom Fellowship Christian Church';
      const tagline=data?.tagline||brand?.querySelector('span')?.textContent||'Revealing Christ to Nations';const logoUrl=data?.logo||'';
      const header=document.createElement('header');header.className='detailSiteHeader';const identity=document.createElement('button');identity.className='brand';identity.type='button';identity.setAttribute('aria-label',name+' home');identity.onclick=()=>{window.location.href='/#home'};
      if(logoUrl){const logo=document.createElement('img');logo.className='brandLogo';logo.alt='';logo.src=logoUrl;logo.onerror=()=>logo.remove();identity.appendChild(logo)}
      const text=document.createElement('span');const b=document.createElement('b');b.textContent=name;const small=document.createElement('small');small.textContent=tagline;text.append(b,small);identity.appendChild(text);
      const nav=document.createElement('nav');nav.className='navLinks';nav.setAttribute('aria-label','Main navigation');Object.keys(labels).forEach(label=>{const a=document.createElement('a');a.textContent=labels[label];a.href=label==='Home'?'/#home':'/#detail/'+routes[label];nav.appendChild(a)});
      const actions=document.createElement('div');actions.style.cssText='display:flex;align-items:center;gap:8px';const menu=document.createElement('button');menu.className='icon menuIcon';menu.setAttribute('aria-label','Open menu');menu.innerHTML='<span style="font-size:22px">☰</span>';actions.appendChild(menu);const search=document.createElement('button');search.className='icon';search.setAttribute('aria-label','Search');search.innerHTML='<span style="font-size:20px">⌕</span>';actions.appendChild(search);
      header.append(identity,nav,actions);old.replaceWith(header);page.classList.add('detail-home-header');
    }
    applyDetailHero();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
