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
  const headerLogo=resolveHeaderLogo(church);

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
        <a href={\`tel:\${church?.phone||''}\`}><Phone size={17}/> Call</a>
        <a href={\`mailto:\${church?.email||''}\`}><Mail size={17}/> Email</a>
        <button onClick={onBack}><ArrowLeft size={17}/> Return to site</button>
      </div>
    </section>
  ) : null;

  return (
    <div className={\`detailPage detailPage-\${key}\${key==='media'?' is-media-hub':''}\`}>
      <header className="detailHeader">
        <div className="detailHeaderBrandRow">
          <div className="detailHeaderInner">
            <a className="detailBrand" href="/?entered=1#home" aria-label="Home">
              {headerLogo&&<img className="detailBrandLogo" src={headerLogo} alt="" onError={e=>{e.currentTarget.style.display='none'}}/>}
              <span><strong>{church?.name||church?.churchName||'Church'}</strong><small>{church?.tagline||''}</small></span>
            </a>
            <button className="detailMobileTrigger" type="button" onClick={menuHandler} aria-label="Open menu"><Menu size={23}/></button>
          </div>
        </div>
        <div className="detailHeaderNavRow">
          <SiteNav church={church} onMenu={menuHandler} activePath={\`detail/\${key}\`}/>
        </div>
      </header>
      <main>
        {heroContent}
        {bodyContent}
        {ctaContent}
      </main>
      {key!=='media'&&<footer className="detailFooter"><strong>{church?.name||church?.churchName||'Church'}</strong><span>{church?.footerTagline||church?.tagline||''}</span></footer>}
      <MobileMenu open={mobileMenu} onClose={()=>setMobileMenu(false)}/>
    </div>
  );
}
`;

fs.writeFileSync(path, source.slice(0, start) + replacement + source.slice(end), 'utf8');
console.log('Normalized DetailPages.jsx render structure for Vite.');
