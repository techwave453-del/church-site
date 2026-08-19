import React,{useEffect,useMemo,useRef,useState}from"react";
import{createRoot}from"react-dom/client";
import{ArrowRight,Globe,Menu,MessageCircle,Search,Volume2,VolumeX,X,Upload,Image,Video as VideoIcon,FileText,LogOut,Save,ShieldCheck}from"lucide-react";
import{DEFAULT_SITE_CONTENT,mergeSiteContent}from"../site-config.js";
import"./styles.css";

const DEFAULT_CHURCH={...DEFAULT_SITE_CONTENT,name:DEFAULT_SITE_CONTENT.churchName,slides:DEFAULT_SITE_CONTENT.gallery};

function Video({videoUrl, fallbackImage}){
	const bgRef = useRef(null);
	const [failed,setFailed]=useState(false);

	useEffect(()=>{
		try{
			if(bgRef.current && bgRef.current.tagName === "IFRAME"){
				bgRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'mute',args:[]}), '*');
			}
		}catch(e){}
	},[]);

	const entryUrl = videoUrl || DEFAULT_CHURCH.videoUrl;
	const isYouTube = /youtu\.be|youtube\.com/.test(entryUrl);
	let youtubeId = null;
	if(isYouTube){const m = entryUrl.match(/(?:v=|vi=|\/)([A-Za-z0-9_-]{11})/); if(m) youtubeId = m[1]; const short = entryUrl.match(/youtu\.be\/([A-Za-z0-9_-]{11})/); if(!youtubeId && short) youtubeId = short[1];}

	return <div className="media">
		<img className="fallback" src={fallbackImage || DEFAULT_CHURCH.fallbackImage} alt="Church congregation worshipping"/>
		{!failed && isYouTube && youtubeId ? (
			<iframe ref={bgRef} className="video" title="background-video" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&enablejsapi=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1`} frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen onError={()=>setFailed(true)}/>
		) : (!failed && <video ref={bgRef} className="video" autoPlay loop muted playsInline preload="auto" poster={fallbackImage || DEFAULT_CHURCH.fallbackImage} onError={()=>setFailed(true)}><source src={entryUrl} type="video/mp4"/></video>)}
		<div className="overlay"/>
	</div>
}

function Header({menu,search,church}){
	const navItems = ["Home","About","Events","Visit Us","Media","Resources","Give","Contact"];
	return (
		<header>
			<div className="brand"><span className="mark">✦</span><div><b>{church.name}</b><small>{church.tagline}</small></div></div>
			<nav className="navLinks" aria-label="Main navigation">
				{navItems.map(x=> <a key={x} href={x==="Home"?"/home":"#"}>{x}</a>)}
			</nav>
			<div style={{display:'flex',alignItems:'center',gap:8}}>
				<button className="icon menuIcon" onClick={menu} aria-label="Open menu"><Menu size={25}/></button>
				<button className="icon" onClick={search} aria-label="Search"><Search size={21}/></button>
			</div>
		</header>
	);
}

function HeroCarousel({slides}){
	const [index,setIndex]=useState(0);
	const prevRef = useRef(slides.length ? slides.length - 1 : 0);

	useEffect(()=>{
		const t = setInterval(()=> setIndex(i=>{
			prevRef.current = i;
			return (i+1) % slides.length;
		}),4000);
		return ()=>clearInterval(t);
	},[slides.length]);

	return <section className="hero carousel">
		<div className="carousel-inner">
			{slides.map((s,idx)=>{
				const cls = `carousel-slide ${idx===index? 'active' : (idx===prevRef.current? 'exiting' : 'entering')}`;
				return (
					<div className={cls} key={idx}>
						{s.type==='video' ? <video className="carousel-media" src={s.src} autoPlay loop muted playsInline/> : <img className="carousel-media" src={s.src} alt={`slide-${idx}`}/>} 
					</div>
				);
			})}
		</div>
	</section>
}

function ImageTile({item,className=''}){
	return <a className={`imageTile ${className}`} href={item.url || '#'} onClick={e=>{if(!item.url || item.url==='#')e.preventDefault()}} style={{'--tile-image':`url("${item.image}")`}}><span className="tileContent"><strong>{item.title}</strong>{item.text && <small>{item.text}</small>}{item.time && <em>{item.time}</em>}</span></a>;
}

function HomeContent({church}){
	const services = Array.isArray(church.services) ? church.services : DEFAULT_CHURCH.services;
	const links = Array.isArray(church.links) ? church.links : DEFAULT_CHURCH.links;
	const classes = Array.isArray(church.membershipClasses) ? church.membershipClasses : DEFAULT_CHURCH.membershipClasses;
	return <div className="homeContent">
		<section className="homeSection aboutSection" id="about">
			<div className="sectionIntro"><span>{church.aboutEyebrow}</span><h2>{church.aboutTitle}</h2><i/></div>
			<p>{church.aboutText}</p>
		</section>
		<section className="homeSection servicesSection" id="services">
			<div className="sectionIntro centered"><span>{church.servicesEyebrow}</span><h2>{church.servicesTitle}</h2></div>
			<div className="tileGrid servicesGrid">{services.map((item,index)=><ImageTile key={`${item.title}-${index}`} item={item} className="serviceTile"/>)}</div>
		</section>
		<section className="homeSection linksSection" id="connect">
			<div className="tileGrid linksGrid">{links.map((item,index)=><ImageTile key={`${item.title}-${index}`} item={item} className="linkTile"/>)}</div>
		</section>
		<section className="homeSection familySection" id="membership">
			<div className="sectionIntro centered"><span>{church.membershipEyebrow}</span><h2>{church.membershipTitle}</h2></div>
			<div className="tileGrid classGrid">
				{classes.map((item,index)=><div className="classTile" key={`${item.title}-${index}`} style={{'--tile-image':`url("${item.image}")`}}><strong>{item.title}</strong><a href={item.registrationUrl || '#'} onClick={e=>{if(!item.registrationUrl || item.registrationUrl==='#')e.preventDefault()}}>Register Now <ArrowRight size={16}/></a></div>)}
			</div>
		</section>
		<footer className="siteFooter"><div><strong>{church.name}</strong><span>{church.footerTagline}</span></div><div><a href={`tel:${church.phone}`}>{church.phone}</a><a href={`mailto:${church.email}`}>{church.email}</a></div><small>&copy; {new Date().getFullYear()} {church.name}. All rights reserved.</small></footer>
	</div>
}

function Drawer({open,close}){if(!open)return null;return <div className="drawer"><div className="drawerTop"><b></b><button className="close" onClick={close}><X/></button></div><nav>{["Home","About","Ministries","Sermons","Events","Give","Contact"].map(x=><a key={x} href={x==="Home"?"/home":"#"} onClick={close}>{x}</a>)}</nav></div>}

function SearchBox({open,close}){const[q,setQ]=useState("");if(!open)return null;return <div className="searchOverlay" onMouseDown={close}><form className="searchBox" onMouseDown={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();alert(`Search: ${q}`)}}><Search/><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search sermons, events, ministries..."/><button type="button" onClick={close}><X/></button></form></div>}

function LandingPage(){
	const [menu,setMenu]=useState(false);
	const [search,setSearch]=useState(false);
	const [audioMuted,setAudioMuted]=useState(true);
	const [lang,setLang]=useState("EN");
	const [entered,setEntered]=useState(false);
	const [siteContent,setSiteContent]=useState(DEFAULT_CHURCH);
	const audioRef = useRef(null);
	const audioReadyRef = useRef(false);

	useEffect(()=>{
		let ignore = false;
		fetch('/api/site/content').then(res=>res.ok ? res.json() : null).then(data=>{
			if(!ignore && data){
				const church = {
					...DEFAULT_CHURCH,
					...data,
					name: data.churchName || data.name || DEFAULT_CHURCH.name,
					slides: Array.isArray(data.gallery) && data.gallery.length ? data.gallery : DEFAULT_CHURCH.slides,
					videoUrl: data.videoUrl || DEFAULT_CHURCH.videoUrl,
					audioUrl: data.audioUrl || DEFAULT_CHURCH.audioUrl,
					fallbackImage: data.fallbackImage || DEFAULT_CHURCH.fallbackImage
				};
				setSiteContent(church);
			}
		}).catch(()=>{});
		return ()=>{ignore = true;};
	},[]);

	const hasAudio = siteContent.audioUrl && /youtu\.be|youtube\.com/.test(siteContent.audioUrl);
	let audioId = null;
	if(hasAudio){const ma = siteContent.audioUrl.match(/(?:v=|vi=|\/)([A-Za-z0-9_-]{11})/); if(ma) audioId = ma[1]; const shorta = siteContent.audioUrl.match(/youtu\.be\/([A-Za-z0-9_-]{11})/); if(!audioId && shorta) audioId = shorta[1];}

	const handleToggleSound = ()=>{
		const next = !audioMuted;
		if(audioRef.current && audioReadyRef.current){
			try{
				if(!next){
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'unMute',args:[]}), '*');
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), '*');
				}else{
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), '*');
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'mute',args:[]}), '*');
				}
			}catch(e){}
		}
		setAudioMuted(next);
	};

	// Effect to apply mute/unmute when audioMuted state changes
	useEffect(()=>{
		if(audioRef.current && audioReadyRef.current && hasAudio){
			try{
				if(audioMuted){
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), '*');
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'mute',args:[]}), '*');
				}else{
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'unMute',args:[]}), '*');
					audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), '*');
				}
			}catch(e){}
		}
	},[audioMuted, hasAudio]);

	const slides = Array.isArray(siteContent.slides) && siteContent.slides.length ? siteContent.slides : DEFAULT_CHURCH.slides;

	return (
		<main className={`page ${entered? 'entered':''}`}>
			<Video videoUrl={siteContent.videoUrl} fallbackImage={siteContent.fallbackImage}/>
			{entered && <Header menu={()=>setMenu(true)} search={()=>setSearch(true)} church={siteContent}/>} 
			{entered ? (
				<><HeroCarousel slides={slides}/><HomeContent church={siteContent}/></>
			) : (
				<section className="hero">
					<span>{siteContent.tagline}</span>
					<h1>{siteContent.title}</h1>
					<p>{siteContent.subtitle}</p>
					<a className="enter" href="/home" onClick={(e)=>{e.preventDefault(); setEntered(true); setAudioMuted(true);}}>{siteContent.cta}<ArrowRight size={17}/></a>
				</section>
			)}
			<div className="language"><Globe size={15}/><button className={lang==="EN"?"active":""} onClick={()=>setLang("EN")}>EN</button><button className={lang==="SW"?"active":""} onClick={()=>setLang("SW")}>SW</button></div>
			{!entered && <button className="sound desktop" onClick={handleToggleSound}>{<span>SOUND</span>}<i/>{audioMuted?<VolumeX/>:<Volume2/>}</button>}
			{!entered && <button className="sound mobile" onClick={handleToggleSound}>{audioMuted?<VolumeX/>:<Volume2/>}</button>}
			<button className="chat" onClick={()=>alert("Live chat coming soon.")}>{<MessageCircle/>}</button>
			<Drawer open={menu} close={()=>setMenu(false)}/>
			<SearchBox open={search} close={()=>setSearch(false)}/>
			{hasAudio && audioId && <iframe ref={audioRef} className="audio-frame" title="background-audio" src={`https://www.youtube.com/embed/${audioId}?autoplay=1&mute=1&enablejsapi=1&controls=0&loop=1&playlist=${audioId}&modestbranding=1&rel=0&origin=${window.location.origin}`} frameBorder="0" allow="autoplay; encrypted-media" onLoad={()=>{
				audioReadyRef.current = true;
				try{
					if(audioRef.current && audioRef.current.tagName === "IFRAME"){
						if(!audioMuted){
							audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'unMute',args:[]}), '*');
							audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), '*');
						}else{
							audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'mute',args:[]}), '*');
							audioRef.current.contentWindow.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), '*');
						}
					}
				}catch(e){}
			}} onError={()=>{}}/>}
		</main>
	);
}

function AdminPanel(){
	const [loggedIn,setLoggedIn]=useState(false);
	const [loginState,setLoginState]=useState({username:'admin',password:'admin123'});
	const [loading,setLoading]=useState(true);
	const [siteData,setSiteData]=useState(DEFAULT_SITE_CONTENT);
	const [mediaItems,setMediaItems]=useState([]);
	const [activeTab,setActiveTab]=useState('site');
	const [notice,setNotice]=useState('');
	const [uploadForm,setUploadForm]=useState({title:'',category:'general',description:'',file:null});

	const readSession = async ()=>{
		try{
			const resp = await fetch('/api/admin/session',{credentials:'include'});
			if(resp.ok){
				setLoggedIn(true);
				await Promise.all([loadSiteData(), loadMedia()]);
			}else{
				setLoggedIn(false);
			}
		}catch(_e){
			setLoggedIn(false);
		}
		setLoading(false);
	};

	const loadSiteData = async ()=>{
		const resp = await fetch('/api/site/content');
		if(resp.ok){
			const payload = await resp.json();
			setSiteData(mergeSiteContent(payload));
		}
	};

	const loadMedia = async ()=>{
		const resp = await fetch('/api/media');
		if(resp.ok){
			setMediaItems(await resp.json());
		}
	};

	useEffect(()=>{readSession();},[]);

	const handleLogin = async (e)=>{
		e.preventDefault();
		setNotice('');
		const resp = await fetch('/api/admin/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(loginState)});
		if(resp.ok){
			setLoggedIn(true);
			await Promise.all([loadSiteData(), loadMedia()]);
		}else{
			const data = await resp.json().catch(()=>({error:'Login failed'}));
			setNotice(data.error || 'Login failed');
		}
	};

	const handleLogout = async ()=>{
		await fetch('/api/admin/logout',{method:'POST',credentials:'include'});
		setLoggedIn(false);
		setNotice('');
	};

	const handleChange = (key,value)=> setSiteData(prev => ({...prev,[key]:value}));
	const handleArrayChange = (key,index,field,value)=> setSiteData(prev => ({...prev,[key]:prev[key].map((item,itemIndex)=>itemIndex===index?({...item,[field]:value}):item)}));

	const handleSave = async ()=>{
		const resp = await fetch('/api/site/content',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(siteData)});
		if(resp.ok){
			setNotice('Site settings saved.');
		}else{
			setNotice('Unable to save settings.');
		}
	};

	const handleUpload = async (e)=>{
		e.preventDefault();
		const file = uploadForm.file;
		if(!file){
			setNotice('Select a file before uploading.');
			return;
		}
		const formData = new FormData();
		formData.append('file', file);
		formData.append('title', uploadForm.title || file.name.replace(/\.[^/.]+$/,''));
		formData.append('category', uploadForm.category || 'general');
		formData.append('description', uploadForm.description || '');
		formData.append('type', file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('image/') ? 'image' : 'document');
		const resp = await fetch('/api/media',{method:'POST',credentials:'include',body: formData});
		if(resp.ok){
			setNotice('File uploaded successfully.');
			setUploadForm({title:'',category:'general',description:'',file:null});
			e.target.reset();
			await loadMedia();
		}else{
			const data = await resp.json().catch(()=>({error:'Upload failed'}));
			setNotice(data.error || 'Upload failed.');
		}
	};

	const handleDeleteMedia = async (id)=>{
		const resp = await fetch(`/api/media/${id}`,{method:'DELETE',credentials:'include'});
		if(resp.ok){
			setNotice('Media deleted.');
			await loadMedia();
		}else{
			setNotice('Media could not be deleted.');
		}
	};

	const tabItems = [
		{key:'site', label:'Site', icon:<ShieldCheck size={16}/>},
		{key:'media', label:'Media', icon:<Image size={16}/>},
		{key:'uploads', label:'Uploads', icon:<Upload size={16}/>}
	];

	if(loading){
		return <div className="admin-loading"><div className="spinner"/><p>Loading admin...</p></div>;
	}

	if(!loggedIn){
		return (
			<div className="admin-shell login-shell">
				<form className="login-panel" onSubmit={handleLogin}>
					<div className="login-header">
						<ShieldCheck size={28}/>
						<h2>Admin Login</h2>
					</div>
					<label>
						<span>Username</span>
						<input value={loginState.username} onChange={(e)=>setLoginState(s=>({...s,username:e.target.value}))} placeholder="admin" />
					</label>
					<label>
						<span>Password</span>
						<input type="password" value={loginState.password} onChange={(e)=>setLoginState(s=>({...s,password:e.target.value}))} placeholder="admin123" />
					</label>
					{notice && <div className="notice danger">{notice}</div>}
					<button type="submit" className="primary-btn">Login</button>
				</form>
			</div>
		);
	}

	return (
		<div className="admin-shell">
			<aside className="admin-sidebar">
				<div className="sidebar-brand">
					<span className="mark">✦</span>
					<div>
						<strong>{siteData.churchName || 'AIC Kitanga'}</strong>
						<small>Content control</small>
					</div>
				</div>
				<nav>
					{tabItems.map(tab => (
						<button key={tab.key} className={activeTab===tab.key ? 'tab-btn active' : 'tab-btn'} onClick={()=>setActiveTab(tab.key)}>
							{tab.icon}
							<span>{tab.label}</span>
						</button>
					))}
				</nav>
				<button className="logout-btn" onClick={handleLogout}><LogOut size={16}/>Logout</button>
			</aside>
			<main className="admin-main">
				<header className="admin-header">
					<h1>Site Administration</h1>
					<p>Update the church landing page and media library.</p>
				</header>

				{notice && <div className="notice">{notice}</div>}

				{activeTab === 'site' && (
					<section className="panel-grid">
						<div className="panel">
							<h3>Basic details</h3>
							<div className="field-grid">
								<label><span>Church name</span><input value={siteData.churchName} onChange={(e)=>handleChange('churchName',e.target.value)}/></label>
								<label><span>Tagline</span><input value={siteData.tagline} onChange={(e)=>handleChange('tagline',e.target.value)}/></label>
								<label><span>Hero title</span><input value={siteData.title} onChange={(e)=>handleChange('title',e.target.value)}/></label>
								<label><span>Subtitle</span><textarea value={siteData.subtitle} onChange={(e)=>handleChange('subtitle',e.target.value)}/></label>
								<label><span>Call to action</span><input value={siteData.cta} onChange={(e)=>handleChange('cta',e.target.value)}/></label>
							</div>
						</div>

						<div className="panel">
							<h3>Media sources</h3>
							<div className="field-grid">
								<label><span>Entry video URL</span><input value={siteData.videoUrl} onChange={(e)=>handleChange('videoUrl',e.target.value)}/></label>
								<label><span>Background audio URL</span><input value={siteData.audioUrl} onChange={(e)=>handleChange('audioUrl',e.target.value)}/></label>
								<label><span>Fallback image</span><input value={siteData.fallbackImage} onChange={(e)=>handleChange('fallbackImage',e.target.value)}/></label>
							</div>
						</div>

						<div className="panel">
							<h3>About section</h3>
							<div className="field-grid">
								<label><span>Eyebrow</span><input value={siteData.aboutEyebrow} onChange={(e)=>handleChange('aboutEyebrow',e.target.value)}/></label>
								<label><span>Title</span><input value={siteData.aboutTitle} onChange={(e)=>handleChange('aboutTitle',e.target.value)}/></label>
								<label><span>About text</span><textarea value={siteData.aboutText} onChange={(e)=>handleChange('aboutText',e.target.value)}/></label>
							</div>
						</div>

						<div className="panel">
							<h3>Services section</h3>
							<div className="field-grid">
								<label><span>Eyebrow</span><input value={siteData.servicesEyebrow} onChange={(e)=>handleChange('servicesEyebrow',e.target.value)}/></label>
								<label><span>Title</span><input value={siteData.servicesTitle} onChange={(e)=>handleChange('servicesTitle',e.target.value)}/></label>
							</div>
							<div className="admin-repeat-list">{siteData.services.map((item,index)=><div className="admin-repeat-item" key={index}><strong>Service {index+1}</strong><label><span>Name</span><input value={item.title} onChange={(e)=>handleArrayChange('services',index,'title',e.target.value)}/></label><label><span>Time</span><input value={item.time} onChange={(e)=>handleArrayChange('services',index,'time',e.target.value)}/></label><label><span>Image URL</span><input value={item.image} onChange={(e)=>handleArrayChange('services',index,'image',e.target.value)}/></label></div>)}</div>
						</div>

						<div className="panel">
							<h3>Homepage links</h3>
							<div className="admin-repeat-list">{siteData.links.map((item,index)=><div className="admin-repeat-item" key={index}><strong>Link {index+1}</strong><label><span>Title</span><input value={item.title} onChange={(e)=>handleArrayChange('links',index,'title',e.target.value)}/></label><label><span>Description</span><input value={item.text} onChange={(e)=>handleArrayChange('links',index,'text',e.target.value)}/></label><label><span>Destination URL</span><input value={item.url} onChange={(e)=>handleArrayChange('links',index,'url',e.target.value)}/></label><label><span>Image URL</span><input value={item.image} onChange={(e)=>handleArrayChange('links',index,'image',e.target.value)}/></label></div>)}</div>
						</div>

						<div className="panel">
							<h3>Membership and footer</h3>
							<div className="field-grid">
								<label><span>Membership eyebrow</span><input value={siteData.membershipEyebrow} onChange={(e)=>handleChange('membershipEyebrow',e.target.value)}/></label>
								<label><span>Membership title</span><input value={siteData.membershipTitle} onChange={(e)=>handleChange('membershipTitle',e.target.value)}/></label>
								<label><span>Footer tagline</span><input value={siteData.footerTagline} onChange={(e)=>handleChange('footerTagline',e.target.value)}/></label>
								<label><span>Phone</span><input value={siteData.phone} onChange={(e)=>handleChange('phone',e.target.value)}/></label>
								<label><span>Email</span><input type="email" value={siteData.email} onChange={(e)=>handleChange('email',e.target.value)}/></label>
							</div>
							<div className="admin-repeat-list">{siteData.membershipClasses.map((item,index)=><div className="admin-repeat-item" key={index}><strong>Class {index+1}</strong><label><span>Name</span><input value={item.title} onChange={(e)=>handleArrayChange('membershipClasses',index,'title',e.target.value)}/></label><label><span>Registration URL</span><input value={item.registrationUrl} onChange={(e)=>handleArrayChange('membershipClasses',index,'registrationUrl',e.target.value)}/></label><label><span>Image URL</span><input value={item.image} onChange={(e)=>handleArrayChange('membershipClasses',index,'image',e.target.value)}/></label></div>)}</div>
						</div>

						<div className="panel">
							<h3>Carousel slides</h3>
							<div className="admin-repeat-list">{siteData.gallery.map((item,index)=><div className="admin-repeat-item" key={index}><strong>Slide {index+1}</strong><label><span>Type</span><select value={item.type} onChange={(e)=>handleArrayChange('gallery',index,'type',e.target.value)}><option value="image">Image</option><option value="video">Video</option></select></label><label><span>Source URL</span><input value={item.src} onChange={(e)=>handleArrayChange('gallery',index,'src',e.target.value)}/></label></div>)}</div>
						</div>
					</section>
				)}

				{activeTab === 'media' && (
					<section className="panel">
						<div className="panel-head">
							<h3>Gallery and media library</h3>
						</div>
						<div className="media-grid">
							{mediaItems.length ? mediaItems.map(item => (
								<div key={item.id} className="media-card">
									{item.type === 'video' ? <VideoIcon size={30}/> : item.type === 'audio' ? <Volume2 size={30}/> : item.type === 'document' ? <FileText size={30}/> : <Image size={30}/>}
									<h4>{item.title}</h4>
									<p>{item.category}</p>
									<a href={item.url} target="_blank" rel="noreferrer">Open file</a>
									<button type="button" className="danger-btn" onClick={()=>handleDeleteMedia(item.id)}>Delete</button>
								</div>
							)) : <div className="empty-state">No media uploaded yet.</div>}
						</div>
					</section>
				)}

				{activeTab === 'uploads' && (
					<section className="panel upload-panel">
						<h3>Upload files</h3>
						<form onSubmit={handleUpload} className="upload-form">
							<label><span>Title</span><input value={uploadForm.title} onChange={(e)=>setUploadForm(s=>({...s,title:e.target.value}))}/></label>
							<label><span>Category</span><input value={uploadForm.category} onChange={(e)=>setUploadForm(s=>({...s,category:e.target.value}))}/></label>
							<label><span>Description</span><textarea value={uploadForm.description} onChange={(e)=>setUploadForm(s=>({...s,description:e.target.value}))}/></label>
							<label><span>Choose file</span><input type="file" onChange={(e)=>setUploadForm(s=>({...s,file:e.target.files?.[0] || null}))}/></label>
							<button type="submit" className="primary-btn"><Upload size={16}/>Upload</button>
						</form>
					</section>
				)}

				<div className="footer-actions">
					<button type="button" className="primary-btn" onClick={handleSave}><Save size={16}/>Save changes</button>
				</div>
			</main>
		</div>
	);
}

function App(){
	const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
	return isAdminRoute ? <AdminPanel/> : <LandingPage/>;
}

createRoot(document.getElementById("root")).render(<App/>);
