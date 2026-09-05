(function(){
  let modeEl,accentEl;
  const DEFAULT_ACCENT='#0b6bcb';
  const validMode=v=>v==='dark'||v==='light';
  const validAccent=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  function applyPreview(){
    const dark=modeEl?.value==='dark';
    const preview=document.getElementById('themePreview');
    const previewText=document.getElementById('themePreviewText');
    if(preview){preview.style.background=dark?'#18212b':'#fff';preview.style.color=dark?'#fff':'#18202a'}
    if(previewText)previewText.style.color=dark?'#d9e2ec':'#66717d';
    document.documentElement.dataset.theme=dark?'dark':'light';
  }
  function setAccent(value){
    const accent=validAccent(value)?value:DEFAULT_ACCENT;
    if(accentEl)accentEl.value=accent;
    document.documentElement.style.setProperty('--accent',accent);
    // The full-screen admin startup/loading screen uses the same live accent.
    document.documentElement.style.setProperty('--loader-accent',accent);
    document.documentElement.style.setProperty('--accent-glow',accent+'33');
    document.querySelectorAll('.theme-option[data-accent]').forEach(el=>el.classList.toggle('active',(el.dataset.accent||'').toLowerCase()===accent.toLowerCase()));
  }
  function initTheme(){
    modeEl=document.getElementById('themeMode');
    accentEl=document.getElementById('themeAccent');
    if(!modeEl||!accentEl)return;
    modeEl.addEventListener('change',()=>{if(!validMode(modeEl.value))modeEl.value='light';applyPreview()});
    accentEl.addEventListener('change',()=>setAccent(accentEl.value));
    document.querySelectorAll('.theme-option[data-accent]').forEach(el=>el.addEventListener('click',()=>setAccent(el.dataset.accent)));
    if(!validMode(modeEl.value))modeEl.value='light';
    setAccent(accentEl.value);
    applyPreview();
  }
  window.setAccent=setAccent;
  window.getAdminThemeSettings=function(){return{mode:validMode(modeEl?.value)?modeEl.value:'light',accent:validAccent(accentEl?.value)?accentEl.value:DEFAULT_ACCENT}};
  window.applyAdminThemeSettings=function(settings){const s=settings||{};if(modeEl)modeEl.value=validMode(s.mode)?s.mode:'light';setAccent(validAccent(s.accent)?s.accent:DEFAULT_ACCENT);applyPreview()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTheme);else initTheme();
})();
