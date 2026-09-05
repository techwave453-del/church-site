(function(){'use strict';
  const isImage=(url,type)=>{const s=String(url||'').split('?')[0].toLowerCase();const t=String(type||'').toLowerCase();return /^data:image\//.test(s)||/^image\//.test(t)||/\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)$/.test(s)||s.includes('/uploads/')||s.includes('/storage/v1/object/public/');};
  const resolve=(value)=>{const raw=String(value||'').trim();if(!raw)return '';if(/^data:image\//i.test(raw)||/^blob:/i.test(raw))return raw;try{const u=new URL(raw,location.origin);if(['http:','https:'].includes(u.protocol))return u.href}catch(_){}return '';};
  const mediaUrl=(item)=>resolve(item?.url||item?.publicUrl||item?.public_url||item?.fileUrl||item?.file_url||item?.path||item?.src||'');
  async function apply(){try{
    const [siteResponse,mediaResponse]=await Promise.all([fetch('/api/site/content',{cache:'no-store'}),fetch('/api/media',{cache:'no-store'})]);
    const site=siteResponse.ok?await siteResponse.json():{};
    const media=mediaResponse.ok?await mediaResponse.json():[];
    const list=Array.isArray(media)?media:[];
    const logoMedia=list.find(item=>{const url=mediaUrl(item);const category=String(item?.category||'').toLowerCase();const title=String(item?.title||item?.name||'').toLowerCase();return url&&isImage(url,item?.type||item?.mimeType||item?.mime_type)&&(category==='logo'||title.includes('logo'));});
    const logo=mediaUrl(logoMedia)||resolve(site.logo||site.churchLogo||site.logoUrl);
    if(!logo||!isImage(logo,logoMedia?.type||logoMedia?.mimeType||logoMedia?.mime_type))return;
    document.querySelectorAll('img').forEach(img=>{
      const cls=String(img.className||'').toLowerCase();
      const alt=String(img.alt||'').toLowerCase();
      if(cls.includes('logo')||cls.includes('brandlogo')||alt.includes('logo')){
        if(img.getAttribute('src')!==logo){img.src=logo;img.style.display='block';img.removeAttribute('hidden');}
        img.onerror=function(){this.style.display='none'};
      }
    });
  }catch(_){} }
  const run=()=>{apply();const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
