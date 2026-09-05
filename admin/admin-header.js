(()=>{
  const root=document.getElementById('adminHeader');
  if(!root)return;
  root.innerHTML=`<header class="admin-header"><div class="admin-header__brand"><img class="admin-header__logo" data-admin-header-logo alt="Church logo"><div class="admin-header__brand-text"><strong class="admin-header__church-name" data-admin-header-name>Kingdom Fellowship Christian Church</strong><span class="admin-header__admin-label">Admin</span></div></div><div class="admin-header__actions"><span id="apiStatus" class="status">API…</span><a class="secondary" href="/">Back to Website</a><button type="button" class="secondary" id="logoutBtn">Log out</button></div></header>`;

  const mediaUrl=item=>item?.url||item?.src||item?.path||item?.fileUrl||item?.publicUrl||'';
  const firstImage=items=>(items||[]).find(item=>String(item?.type||'').toLowerCase().startsWith('image/')||['image','logo'].includes(String(item?.category||'').toLowerCase()));
  const setHeaderBranding=(content,mediaItems=[])=>{
    const name=content?.churchName||content?.church_name||content?.siteName||content?.site_name||'Kingdom Fellowship Christian Church';
    const logo=content?.logoUrl||content?.logo_url||content?.logo||content?.churchLogo||content?.church_logo||mediaUrl(firstImage(mediaItems));
    const nameEl=root.querySelector('[data-admin-header-name]');
    const logoEl=root.querySelector('[data-admin-header-logo]');
    if(nameEl)nameEl.textContent=name;
    if(logoEl){if(logo){logoEl.src=logo;logoEl.style.display='block';}else{logoEl.removeAttribute('src');logoEl.style.display='none';}}
  };
  const loadAdminBranding=async()=>{
    let content={};let media=[];
    try{const r=await fetch('/api/site/content',{credentials:'same-origin'});if(r.ok)content=await r.json();}catch(_){ }
    try{const r=await fetch('/api/media',{credentials:'same-origin'});if(r.ok){const data=await r.json();media=Array.isArray(data)?data:(data.items||data.media||[]);}}catch(_){ }
    setHeaderBranding(content,media);
  };
  loadAdminBranding();

  const status=document.getElementById('apiStatus');
  fetch('/api/health',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw new Error();status.textContent='API online';status.className='status ok';}).catch(()=>{status.textContent='API offline';status.className='status bad';});
  document.getElementById('logoutBtn')?.addEventListener('click',async()=>{try{await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin'});}finally{location.reload();}});

  const installPasswordToggles=()=>{document.querySelectorAll('input[type="password"]').forEach(input=>{if(input.dataset.peekReady)return;input.dataset.peekReady='1';const wrap=input.parentElement;if(!wrap)return;wrap.style.position='relative';const btn=document.createElement('button');btn.type='button';btn.className='admin-password-peek';btn.setAttribute('aria-label','Show password');btn.textContent='◉';btn.addEventListener('click',()=>{const shown=input.type==='text';input.type=shown?'password':'text';btn.setAttribute('aria-label',shown?'Show password':'Hide password');});wrap.appendChild(btn);});};
  installPasswordToggles();
  new MutationObserver(installPasswordToggles).observe(document.body,{subtree:true,childList:true});
  const script=document.createElement('script');script.src='/admin/admin-loader.js?v=20260906-2';document.head.appendChild(script);
})();
