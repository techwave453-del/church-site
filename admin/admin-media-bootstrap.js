(function(){
'use strict';
if(typeof window.loadMedia==='function') return;
const api=(url,opt={})=>window.adminApi?window.adminApi(url,opt):fetch(url,{credentials:'include',cache:'no-store',...opt});
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const categories=['general','hero','logo','gallery','services','about','events','resources','sermons','youth','worship','documents','other'];
const state={items:[]};
function render(){
 const root=document.getElementById('media'); if(!root)return;
 root.innerHTML='<div class="am-shell"><section class="am-hero"><div><h2>Media Center</h2><p>Upload, organize and publish the church media library.</p></div><div id="amStats" class="am-stats"></div></section><section class="card"><div class="am-section-head"><div><h3>Media Library</h3><p id="amResultText">Loading media…</p></div><button class="secondary small" id="amBootstrapRefresh" type="button">Refresh</button></div><div id="mediaList" class="am-library"><div class="am-empty">Loading media…</div></div></section></div>';
 document.getElementById('amBootstrapRefresh').onclick=window.loadMedia;
}
function draw(){
 const box=document.getElementById('mediaList'); if(!box)return;
 box.innerHTML=state.items.length?state.items.map(x=>`<article class="am-card"><div class="am-preview">${x.type==='image'?`<img src="${esc(x.url)}" alt="${esc(x.title)}" loading="lazy">`:x.type==='video'?`<video src="${esc(x.url)}" controls preload="metadata"></video>`:x.type==='audio'?`<audio src="${esc(x.url)}" controls></audio>`:'<div class="am-file-icon">PDF</div>'}</div><div class="am-card-body"><div class="am-card-title">${esc(x.title||'Untitled')}</div><div class="am-card-meta">${esc(x.category||'general')} · ${x.published===false?'Draft':'Published'}${x.featured?' · ★ Featured Video':''}</div><div class="am-card-desc">${esc(x.description||'')}</div></div></article>`).join(''):'<div class="am-empty"><strong>Your media library is empty</strong><span>Upload media from the Media Center.</span></div>';
 const r=document.getElementById('amResultText');if(r)r.textContent=`Showing ${state.items.length} media ${state.items.length===1?'item':'items'}.`;
 const s=document.getElementById('amStats');if(s)s.innerHTML=`<div class="am-stat"><strong>${state.items.length}</strong><span>Library items</span></div><div class="am-stat"><strong>${state.items.filter(x=>x.type==='image').length}</strong><span>Images</span></div><div class="am-stat"><strong>${state.items.filter(x=>x.type==='video').length}</strong><span>Videos</span></div><div class="am-stat"><strong>${state.items.filter(x=>x.published!==false).length}</strong><span>Published</span></div>`;
}
window.loadMedia=async function(){
 const root=document.getElementById('media');if(!root)throw new Error('Media Center container is missing.');
 render();
 try{const r=await api('/api/media',{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!r.ok)throw new Error(`Media API returned ${r.status}`);const data=await r.json();state.items=Array.isArray(data)?data:(Array.isArray(data?.items)?data.items:[]);draw();}
 catch(e){const box=document.getElementById('mediaList');if(box)box.innerHTML=`<div class="am-empty"><strong>Unable to load the media library</strong><span>${esc(e.message||'Please refresh the page and try again.')}</span></div>`;console.error('Media Center API error:',e);}
};
window.initAdminMedia=window.loadMedia;
})();
