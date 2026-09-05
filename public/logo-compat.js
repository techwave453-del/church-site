(function(){'use strict';
  const isImage=(url,type)=>{const s=String(url||'').split('?')[0].toLowerCase();const t=String(type||'').toLowerCase();return /^data:image\\//.test(s)||/^blob:/i.test(s)||/^image\\//.test(t)||/\\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/.test(s)||s.includes('/uploads/')||s.includes('/storage/v1/object/public/');};
  const resolve=(value)=>{const raw=String(value||'').trim();if(!raw)return '';if(/^data:image\\//i.test(raw)||/^blob:/i.test(raw))return raw;try{const u=new URL(raw,location.origin);if(['http:','https:'].includes(u.protocol))return u.href}catch(_){}return '';};
  const mediaUrl=(item)=>resolve(item?.url||item?.publicUrl||item?.public_url||item?.fileUrl||item?.file_url||item?.path||item?.src||'');
  const targets=()=>Array.from(document.querySelectorAll('img')).filter(img=>{const cls=String(img.className||'').toLowerCase();const alt=String(img.alt||'').toLowerCase();return img.id==='churchLogo'||img.id==='logo'||cls.includes('logo')||cls.includes('brandlogo')||alt.includes('logo');});
  const liveHeader=()=>document.querySelector('.site-header');
  const hideLiveHeaderDefaults=()=>{if(!liveHeader())return;let style=document.getElementById('liveHeaderDataGate');if(!style){style=document.createElement('style');style.id='liveHeaderDataGate';style.textContent='.site-header .brand-name,.site-header .brand-tagline{visibility:hidden!important}';document.head.appendChild(style);}};
  const revealLiveHeader=()=>{const style=document.getElementById('liveHeaderDataGate');if(style)style.textContent='.site-header .brand-name,.site-header .brand-tagline{visibility:visible!important}';};
  let lastLogo='';
  async function apply(){try{
    hideLiveHeaderDefaults();
    const siteResponse=await fetch('/api/site/content',{cache:'no-store',credentials:'same-origin'});const site=siteResponse.ok?await siteResponse.json():{};
    const name=String(site.churchName||site.name||'').trim();const tagline=String(site.tagline||'').trim();
    if(name){const el=document.getElementById('churchName');if(el)el.textContent=name;}
    if(tagline){const el=document.getElementById('churchTagline');if(el)el.textContent=tagline;}
    revealLiveHeader();
    let logo=resolve(site.logo||site.churchLogo||site.logoUrl);let logoType='image';
    if(!logo){const mediaResponse=await fetch('/api/media',{cache:'no-store',credentials:'same-origin'});const media=mediaResponse.ok?await mediaResponse.json():[];const list=Array.isArray(media)?media:[];const logoMedia=list.find(item=>{const url=mediaUrl(item);const category=String(item?.category||'').trim().toLowerCase();const title=String(item?.title||item?.name||'').trim().toLowerCase();return url&&isImage(url,item?.type||item?.mimeType||item?.mime_type)&&(category==='logo'||title==='logo'||title.includes('church logo'));});logo=mediaUrl(logoMedia);logoType=logoMedia?.type||logoMedia?.mimeType||logoMedia?.mime_type||'image';}
    if(logo&&isImage(logo,logoType)){if(logo!==lastLogo||targets().some(img=>img.src!==logo)){lastLogo=logo;targets().forEach(img=>{if(img.getAttribute('src')!==logo)img.setAttribute('src',logo);img.style.display='block';img.removeAttribute('hidden');img.onerror=function(){this.style.display='none';};});}}
  }catch(_){revealLiveHeader();} }
  function fixMobileMenu(){const button=document.getElementById('mobileMenuButton');if(!button)return;let style=document.getElementById('liveMobileMenuCompat');if(!style){style=document.createElement('style');style.id='liveMobileMenuCompat';style.textContent='@media(max-width:760px){.mobile-menu-button{display:flex!important;align-items:center;justify-content:center;width:42px;height:36px;margin-left:auto;border:0;border-radius:6px;background:#0a3965!important;color:#fff!important;font-size:24px;line-height:1;cursor:pointer;padding:0;visibility:visible!important;opacity:1!important}}';document.head.appendChild(style);}}
  let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();fixMobileMenu();});};
  const run=()=>{hideLiveHeaderDefaults();schedule();const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();