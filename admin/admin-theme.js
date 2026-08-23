(function(){
  function initTheme(){
    const mode=document.getElementById('themeMode');
    const accent=document.getElementById('themeAccent');
    const preview=document.getElementById('themePreview');
    const previewText=document.getElementById('themePreviewText');
    if(!mode||!accent)return;
    function setAccent(value){
      if(!/^#[0-9a-f]{6}$/i.test(value))return;
      accent.value=value;
      document.documentElement.style.setProperty('--accent',value);
      document.querySelectorAll('.theme-option').forEach(el=>el.classList.toggle('active',(el.dataset.accent||'').toLowerCase()===value.toLowerCase()));
    }
    function applyPreview(){
      const dark=mode.value==='dark';
      if(preview)preview.style.background=dark?'#18212b':'#fff';
      if(preview)preview.style.color=dark?'#fff':'#18202a';
      if(previewText)previewText.style.color=dark?'#d9e2ec':'#66717d';
    }
    window.setAccent=setAccent;
    mode.addEventListener('change',applyPreview);
    accent.addEventListener('change',()=>setAccent(accent.value));
    document.querySelectorAll('.theme-option[data-accent]').forEach(el=>el.addEventListener('click',()=>setAccent(el.dataset.accent)));
    applyPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTheme);else initTheme();
})();
