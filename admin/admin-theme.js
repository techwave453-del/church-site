(function(){
  let modeEl,accentEl;
  function initTheme(){
    modeEl=document.getElementById('themeMode');
    accentEl=document.getElementById('themeAccent');
    const preview=document.getElementById('themePreview');
    const previewText=document.getElementById('themePreviewText');
    if(!modeEl||!accentEl)return;
    function setAccent(value){if(!/^#[0-9a-f]{6}$/i.test(value))return;accentEl.value=value;document.documentElement.style.setProperty('--accent',value);document.querySelectorAll('.theme-option').forEach(el=>el.classList.toggle('active',(el.dataset.accent||'').toLowerCase()===value.toLowerCase()))}
    function applyPreview(){const dark=modeEl.value==='dark';if(preview)preview.style.background=dark?'#18212b':'#fff';if(preview)preview.style.color=dark?'#fff':'#18202a';if(previewText)previewText.style.color=dark?'#d9e2ec':'#66717d';document.documentElement.dataset.theme=dark?'dark':'light'}
    window.setAccent=setAccent;
    modeEl.addEventListener('change',applyPreview);
    accentEl.addEventListener('change',()=>setAccent(accentEl.value));
    document.querySelectorAll('.theme-option[data-accent]').forEach(el=>el.addEventListener('click',()=>setAccent(el.dataset.accent)));
    applyPreview();
  }
  window.getAdminThemeSettings=function(){return{mode:modeEl?.value||'light',accent:accentEl?.value||'#0b6bcb'}};
  window.applyAdminThemeSettings=function(settings){const s=settings||{};if(modeEl&&s.mode)modeEl.value=s.mode;if(accentEl&&s.accent){accentEl.value=s.accent;document.documentElement.style.setProperty('--accent',s.accent)}const preview=document.getElementById('themePreview');const previewText=document.getElementById('themePreviewText');const dark=modeEl?.value==='dark';if(preview){preview.style.background=dark?'#18212b':'#fff';preview.style.color=dark?'#fff':'#18202a'}if(previewText)previewText.style.color=dark?'#d9e2ec':'#66717d'};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTheme);else initTheme();
})();
