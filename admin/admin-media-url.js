(function(){
  'use strict';
  const api=(url,opt={})=>window.adminApi?window.adminApi(url,opt):fetch(url,{credentials:'include',...opt});
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const categories=['general','hero','logo','gallery','services','about','events','resources','sermons','youth','worship','documents','other'];
  const notify=(message,error=false)=>window.showAdminMessage?.(message,error);
  const readError=async(r,fallback)=>{try{const data=await r.json();return data?.error||fallback}catch{return fallback}};
  let enhanced=false;

  function addStyles(){
    if(document.getElementById('adminMediaUrlStyles'))return;
    const style=document.createElement('style');
    style.id='adminMediaUrlStyles';
    style.textContent=`
      .am-source-card{border:1px solid #e3e8ed;background:#fff;border-radius:15px;padding:20px;margin-bottom:17px;box-shadow:0 5px 22px #0000000b}
      .am-source-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:14px}
      .am-source-head h3{margin:0 0 3px;font-size:18px}
      .am-source-head p{margin:0;color:#66717d}
      .am-source-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
      .am-source-tab{background:#eef2f5;color:#18202a;border:1px solid #d9e0e5;border-radius:9px;padding:8px 12px;font-weight:700;cursor:pointer}
      .am-source-tab.active{background:#0b6bcb;color:#fff;border-color:#0b6bcb}
      .am-url-form{display:grid;gap:12px}
      .am-url-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:12px}
      .am-url-grid.three{grid-template-columns:1.5fr 1fr 1fr}
      .am-url-help{font-size:12px;color:#66717d;margin-top:5px}
      .am-url-actions{display:flex;justify-content:flex-end;gap:8px;align-items:center;flex-wrap:wrap}
      @media(max-width:650px){.am-url-grid,.am-url-grid.three{grid-template-columns:1fr}.am-source-card{padding:15px}}
    `;
    document.head.appendChild(style);
  }

  function build(){
    const shell=document.querySelector('#media .am-shell');
    if(!shell)return false;
    if(shell.querySelector('#amUrlSourceCard'))return true;
    addStyles();
    const card=document.createElement('section');
    card.className='am-source-card';
    card.id='amUrlSourceCard';
    card.innerHTML=`
      <div class="am-source-head">
        <div><h3>Add media without uploading a file</h3><p>Save YouTube, image, audio or direct video URLs in the Media Library. Large videos stay external, so they do not consume church storage.</p></div>
      </div>
      <div class="am-source-tabs" role="tablist" aria-label="Media source">
        <button type="button" class="am-source-tab active" data-source="url">Add URL</button>
        <button type="button" class="am-source-tab" data-source="file">Upload File</button>
      </div>
      <form id="amUrlForm" class="am-url-form">
        <div class="am-url-grid three">
          <label>Title<input id="amUrlTitle" maxlength="200" placeholder="e.g. Sunday Worship — 5 September" required></label>
          <label>Media type<select id="amUrlType"><option value="video">Video / YouTube</option><option value="image">Image</option><option value="audio">Audio</option><option value="document">PDF / Document</option></select></label>
          <label>Category<select id="amUrlCategory">${categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label>
        </div>
        <label>Media URL<input id="amUrlValue" type="url" maxlength="2000" placeholder="https://youtube.com/watch?v=… or https://example.com/video.mp4" required><span class="am-url-help">YouTube links are embedded on the public Media page. Direct MP4/WebM links are played in the page player.</span></label>
        <label>Description<textarea id="amUrlDescription" maxlength="2000" placeholder="Optional description for visitors."></textarea></label>
        <div class="am-url-actions"><button class="primary" type="submit" id="amUrlSave">Save to Media Library</button></div>
      </form>`;
    const firstCard=shell.querySelector('.card');
    shell.insertBefore(card,firstCard||shell.firstChild);

    card.querySelectorAll('[data-source]').forEach(tab=>tab.addEventListener('click',()=>{
      const source=tab.dataset.source;
      card.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('active',x===tab));
      const upload=card.nextElementSibling;
      if(upload&&upload.classList.contains('card'))upload.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    card.querySelector('#amUrlForm').addEventListener('submit',saveUrl);
    enhanced=true;
    return true;
  }

  async function saveUrl(event){
    event.preventDefault();
    const button=document.getElementById('amUrlSave');
    const payload={
      title:document.getElementById('amUrlTitle').value.trim(),
      type:document.getElementById('amUrlType').value,
      category:document.getElementById('amUrlCategory').value,
      url:document.getElementById('amUrlValue').value.trim(),
      description:document.getElementById('amUrlDescription').value.trim()
    };
    if(!payload.title||!payload.url){notify('Title and media URL are required.',true);return}
    button.disabled=true;button.textContent='Saving…';
    try{
      const response=await api('/api/media/url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok){notify(await readError(response,'Unable to save the media URL.'),true);return}
      notify('Media URL saved to the library.');
      document.getElementById('amUrlForm').reset();
      document.getElementById('amUrlType').value='video';
      await window.loadMedia();
    }catch(error){notify(error?.message||'Unable to save the media URL.',true)}
    finally{button.disabled=false;button.textContent='Save to Media Library'}
  }

  function install(){
    if(window.__adminMediaUrlEnhancerInstalled)return;
    if(typeof window.loadMedia!=='function')return;
    const original=window.loadMedia;
    window.__adminMediaUrlEnhancerInstalled=true;
    window.loadMedia=async function(){
      const result=await original.apply(this,arguments);
      enhanced=false;
      build();
      return result;
    };
    build();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  const observer=new MutationObserver(()=>{if(!enhanced)build()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(install,0);setTimeout(install,250);setTimeout(install,1000);
})();
