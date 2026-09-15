import fs from 'node:fs';

const path = 'src/DetailPages.jsx';
const source = fs.readFileSync(path, 'utf8');
const start = source.indexOf('function DetailPage(');
const end = source.indexOf('export function DetailRouter', start);

if (start < 0 || end < 0) {
  throw new Error('Could not locate DetailPage boundaries in src/DetailPages.jsx');
}

const replacement = String.raw`function DetailPage({church,type,onBack,onMenu}){
  const key=type||'about';
  const item=getDetail(church,key);
  const service=Array.isArray(church?.services)?church.services.find(s=>slugify(s?.title)===slugify(key)):null;
  const[mobileMenu,setMobileMenu]=useState(false);
  const menuHandler=onMenu||(()=>setMobileMenu(true));

  let heroContent=null;
  if(key==='media'){
    heroContent=null;
  }else if(service){
    heroContent=<ServiceHero service={service}/>;
  }else if(key==='visit-us'){
    heroContent=(
      <>
        <section className="detailHero visitHero">
          <span>{item.eyebrow}</span>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </section>
        <VisitContent church={church} item={item}/>
      </>
    );
  }else{
    heroContent=(
      <section className="detailHero">
        <span>{item.eyebrow}</span>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        {item.schedule&&<div className="detailSchedule"><Clock3 size={18}/>{item.schedule}</div>}
      </section>
    );
  }

  let bodyContent=null;
  if(key==='media'){
    bodyContent=<MediaLibrary church={church}/>;
  }else if(service){
    bodyContent=(
      <section className="detailGrid">
        {item.sections.map((s,i)=><article key={i}>
          <div className="detailIcon"><ArrowRight size={18}/></div>
          <h2>{Array.isArray(s)?s[0]:s.heading}</h2>
          <p>{Array.isArray(s)?s[1]:s.text||s.description||''}</p>
        </article>)}
      </section>
    );
  }else if(key==='visit-us'){
    bodyContent=null;
  }else{
    bodyContent=(
      <section className="detailGrid">
        {item.sections.map((s,i)=><article key={i}>
          <div className="detailIcon"><ArrowRight size={18}/></div>
          <h2>{Array.isArray(s)?s[0]:s.heading}</h2>
          <p>{Array.isArray(s)?s[1]:s.text||s.description||''}</p>
        </article>)}
      </section>
    );
  }

  const ctaContent=key!=='media' ? (
    <section className="detailCta">
      <div>
        <span>{church?.name||church?.churchName||'Church'}</span>
        <h2>Have questions or want to get connected?</h2>
        <p>Our church team will be happy to help.</p>
      </div>
      <div className="detailActions">
        <a href={'tel:'+(church?.phone||'')}><Phone size={17}/> Call</a>
        <a href={'mailto:'+(church?.email||'')}><Mail size={17}/> Email</a>
        <button onClick={onBack}><ArrowLeft size={17}/> Return to site</button>
      </div>
    </section>
  ) : null;

  const logo=resolveHeaderLogo(church);
  return (
    <div className={'detailPage detailPage-'+key+(key==='media'?' is-media-hub':'')}>
      <header>
        <button className="brand" type="button" onClick={()=>{window.location.hash='home'}} aria-label={`${church?.name||church?.churchName||'Church'} home`}>
          {logo?<img className="brandLogo" src={logo} alt="" onError={e=>{e.currentTarget.style.display='none'}}/>:<span className="mark">✧</span>}
          <span><b>{church?.name||church?.churchName||'Church'}</b><small>{church?.tagline||''}</small></span>
        </button>
        <button className="icon mobile-menu-trigger" type="button" onClick={menuHandler} aria-label="Open menu"><Menu size={24}/></button>
        <nav className="navLinks" aria-label="Main navigation">
          <div className="navActions">
            <button className="icon menuIcon" type="button" onClick={menuHandler} aria-label="Open menu"><Menu size={25}/></button>
            <button className="icon header-search" type="button" onClick={()=>{window.location.href='/?entered=1#home'}} aria-label="Search"><Search size={21}/></button>
          </div>
        </nav>
      </header>
      <main>
        {heroContent}
        {bodyContent}
        {ctaContent}
      </main>
      {key!=='media'&&<footer className="detailFooter"><strong>{church?.name||church?.churchName||'Church'}</strong><span>{church?.footerTagline||church?.tagline||''}</span></footer>}
      {mobileMenu&&<div className="drawer"><div className="drawerTop"><b>Menu</b><button className="close" type="button" onClick={()=>setMobileMenu(false)} aria-label="Close menu">×</button></div><nav aria-label="Mobile navigation"></nav></div>}
    </div>
  );
}
`;

fs.writeFileSync(path, source.slice(0, start) + replacement + source.slice(end), 'utf8');
console.log('Normalized DetailPages.jsx to use the canonical homepage header.');