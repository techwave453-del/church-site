(function(){'use strict';
  const isImage=(url)=>{const s=String(url||'').split('?')[0].toLowerCase();return /^data:image\//.test(s)||/\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/.test(s)||s.includes('/uploads/')||s.includes('/storage/v1/object/public/');};
  const resolve=(value)=>{const raw=String(value||'').trim();if(!raw)return '';if(/^data:image\//i.test(raw)||/^blob:/i.test(raw))return raw;try{const u=new URL(raw,location.origin);if(['http:','https:'].includes(u.protocol))return u.href}catch(_){}return '';};
  async function apply(){try{const r=await fetch('/api/site/content',{cache:'no-store'});if(!r.ok)return;const c=await r.json();const logo=resolve(c.logo||c.churchLogo||c.logoUrl);if(!logo||!isImage(logo))return;document.querySelectorAll('img').forEach(img=>{const cls=String(img.className||'').toLowerCase();const alt=String(img.alt||'').toLowerCase();if(cls.includes('logo')||cls.includes('brandlogo')||alt.includes('logo')){if(!img.getAttribute('src')||img.getAttribute('src')!==logo){img.src=logo;img.style.display='block';img.onerror=function(){this.style.display='none'}}}})}catch(_){} }
  const run=()=>{apply();const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
