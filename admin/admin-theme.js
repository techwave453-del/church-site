(function(){
  let modeEl,accentEl;
  const DEFAULT_ACCENT='#0b6bcb';
  const validMode=v=>v==='dark'||v==='light';
  const validAccent=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);

  function ensureThemeStyles(){
    if(document.querySelector('link[data-admin-theme-components]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/admin/admin-theme-components.css?v='+encodeURIComponent(window.__ADMIN_BUILD_VERSION||Date.now());
    link.dataset.adminThemeComponents='true';
    document.head.appendChild(link);
  }

  function applyAccentContrast(accent){
    const hex=String(accent||DEFAULT_ACCENT).replace('#','');
    const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
    const luminance=(0.2126*r+0.7152*g+0.0722*b)/255;
    const contrast=luminance>0.58?'#17202a':'#fff';
    document.documentElement.style.setProperty('--admin-accent',accent);
    document.documentElement.style.setProperty('--admin-accent-contrast',contrast);
  }

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
    document.documentElement.style.setProperty('--loader-accent',accent);
    document.documentElement.style.setProperty('--accent-glow',accent+'33');
    applyAccentContrast(accent);
    document.querySelectorAll('.theme-option[data-accent]').forEach(el=>el.classList.toggle('active',(el.dataset.accent||'').toLowerCase()===accent.toLowerCase()));
  }

  function initTheme(){
    ensureThemeStyles();
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

  ensureThemeStyles();
  window.setAccent=setAccent;
  window.getAdminThemeSettings=function(){return{mode:validMode(modeEl?.value)?modeEl.value:'light',accent:validAccent(accentEl?.value)?accentEl.value:DEFAULT_ACCENT}};
  window.applyAdminThemeSettings=function(settings){const s=settings||{};if(modeEl)modeEl.value=validMode(s.mode)?s.mode:'light';setAccent(validAccent(s.accent)?s.accent:DEFAULT_ACCENT);applyPreview()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTheme);else initTheme();
})();
