/* Floating Live control: shown immediately after the visitor enters the site. */
(function(){
  const addStyles=()=>{
    if(document.getElementById('live-enhancer-styles'))return;
    const style=document.createElement('style');style.id='live-enhancer-styles';style.textContent=`
      #live-floating-button{display:none!important}
      #live-enhancer-button{position:fixed;right:24px;bottom:92px;z-index:9998;width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ff3030,#c90000);color:#fff;cursor:pointer;box-shadow:0 14px 36px rgba(0,0,0,.32);font:800 11px Arial,sans-serif;letter-spacing:.04em}
      #live-enhancer-button:hover{transform:translateY(-2px)}
      #live-enhancer-button span:before{content:"";display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%;background:#fff;vertical-align:1px;animation:liveEnhancerPulse 1.4s infinite}
      @keyframes liveEnhancerPulse{50%{opacity:.45;transform:scale(.8)}}
      @media(max-width:700px){#live-enhancer-button{right:14px;bottom:74px;width:52px;height:52px}}
    `;document.head.appendChild(style);
  };
  const mount=()=>{
    if(!document.querySelector('.page.entered'))return;
    addStyles();
    let button=document.getElementById('live-enhancer-button');
    if(!button){button=document.createElement('button');button.id='live-enhancer-button';button.type='button';button.setAttribute('aria-label','Open live worship service');button.innerHTML='<span>LIVE</span>';document.body.appendChild(button)}
    button.onclick=()=>{window.location.href='/live.html'};
  };
  const waitForEntry=()=>{addStyles();if(document.querySelector('.page.entered')){mount();return}const observer=new MutationObserver(()=>{if(document.querySelector('.page.entered')){observer.disconnect();mount()}});observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForEntry,{once:true});else waitForEntry();
})();
