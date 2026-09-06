(() => {
  const KEY='church_chat_welcome_v3', MAX=3, FIRST=3500, REPEAT=48000;
  const mobile=()=>matchMedia('(max-width:600px)').matches, device=()=>mobile()?'mobile':'desktop';
  const countKey=()=>`${KEY}_count_${device()}`, doneKey=()=>`${KEY}_${device()}`;
  let shown=Number(sessionStorage.getItem(countKey())||0), hidden=false, timer;

  const style=document.createElement('style');
  style.textContent=`
  .church-chat-welcome{position:fixed;right:24px;bottom:158px;z-index:2147483000;width:min(390px,calc(100vw - 34px));font-family:inherit;animation:ccwIn .45s cubic-bezier(.2,.85,.2,1);filter:drop-shadow(0 16px 34px rgba(0,0,0,.22))}
  .church-chat-welcome-bubble{position:relative;padding:18px;border-radius:20px 20px 7px 20px;background:#fff;color:#18242c;border:1px solid color-mix(in srgb,var(--accent-2,#4da6ff) 20%,#fff);box-shadow:0 10px 30px rgba(0,0,0,.12);overflow:hidden}
  .church-chat-welcome-bubble:before{content:'';position:absolute;left:0;top:0;width:4px;height:100%;background:linear-gradient(180deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff),var(--accent-3,#24537d))}
  .church-chat-welcome-close{position:absolute;right:8px;top:8px;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.05);color:#66747e;font-size:18px;cursor:pointer;z-index:2}
  .church-chat-welcome-top{display:flex;align-items:center;gap:10px;padding-right:28px;margin-bottom:12px}.church-chat-welcome-avatar{width:42px;height:42px;flex:0 0 42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff));color:#fff;font-size:18px;font-weight:800;overflow:hidden;position:relative}.church-chat-welcome-avatar img{width:100%;height:100%;object-fit:cover}.church-chat-welcome-online{position:absolute;right:0;bottom:0;width:10px;height:10px;border-radius:50%;background:#2fb86b;border:2px solid #fff}.church-chat-welcome-name{font-size:12px;font-weight:800;color:var(--accent-3,#24537d)}.church-chat-welcome-role{font-size:10px;color:#7a8790;margin-top:3px}.church-chat-welcome-time{margin-left:auto;font-size:9px;color:#98a3ac;align-self:flex-start}
  .church-chat-welcome-heading{font-size:16px;font-weight:800;margin:0 0 5px 3px}.church-chat-welcome-text{font-size:12.5px;line-height:1.5;color:#46535d;margin-left:3px}.church-chat-welcome-text strong{color:var(--accent-3,#24537d)}
  .church-chat-welcome-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:15px 0 0 3px}.church-chat-welcome-action{min-height:42px;border:0;border-radius:12px;padding:7px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:inherit;font-size:10px;font-weight:800;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}.church-chat-welcome-action:hover{transform:translateY(-2px);box-shadow:0 7px 16px rgba(0,0,0,.12)}.church-chat-welcome-chat{background:linear-gradient(135deg,var(--accent-2,#4da6ff),var(--accent-3,#24537d));color:#fff}.church-chat-welcome-tour{background:#edf6ff;color:#24537d;border:1px solid #cfe5fa}.church-chat-welcome-exit{background:#f5f6f7;color:#65727b;border:1px solid #e1e5e8}.church-chat-welcome-action .ico{font-size:16px;line-height:1}

  .church-site-tour{position:fixed;inset:0;z-index:2147482990;pointer-events:none;font-family:inherit}
  .church-site-tour-backdrop{position:absolute;inset:0;background:rgba(5,12,18,.62);pointer-events:auto;backdrop-filter:blur(1px)}
  .church-site-tour-hole{position:absolute;border-radius:15px;box-shadow:0 0 0 3px rgba(255,255,255,.96),0 0 0 7px color-mix(in srgb,var(--accent-2,#4da6ff) 70%,transparent),0 0 0 9999px rgba(5,12,18,.62);pointer-events:none;transition:left .4s ease,top .4s ease,width .4s ease,height .4s ease;z-index:2}
  .church-site-tour-targeting{position:relative;z-index:2147482992!important}
  .church-site-tour-guide{position:fixed;z-index:5;width:min(360px,calc(100vw - 28px));display:flex;align-items:flex-end;gap:10px;pointer-events:auto;transition:left .4s ease,top .4s ease,right .4s ease,bottom .4s ease}
  .church-site-tour-avatar{width:82px;height:104px;flex:0 0 82px;position:relative;filter:drop-shadow(0 10px 15px rgba(0,0,0,.24));animation:tourAvatarFloat 3s ease-in-out infinite}
  .church-site-tour-avatar .avatar-body{position:absolute;left:18px;bottom:0;width:50px;height:58px;border-radius:25px 25px 13px 13px;background:linear-gradient(160deg,var(--accent-2,#4da6ff),var(--accent-3,#24537d));border:3px solid #fff}
  .church-site-tour-avatar .avatar-neck{position:absolute;left:36px;top:43px;width:14px;height:14px;border-radius:5px;background:#c98e6d}
  .church-site-tour-avatar .avatar-head{position:absolute;left:23px;top:5px;width:38px;height:43px;border-radius:48% 48% 44% 44%;background:#d99a75;border:3px solid #fff;z-index:2}
  .church-site-tour-avatar .avatar-hair{position:absolute;left:23px;top:1px;width:39px;height:22px;border-radius:50% 50% 42% 38%;background:#27343d;z-index:3}
  .church-site-tour-avatar .avatar-eye{position:absolute;top:25px;width:4px;height:5px;border-radius:50%;background:#17212b;z-index:4}.church-site-tour-avatar .eye-l{left:32px}.church-site-tour-avatar .eye-r{left:47px}
  .church-site-tour-avatar .avatar-smile{position:absolute;left:37px;top:34px;width:10px;height:5px;border-bottom:2px solid #7e4d42;border-radius:0 0 10px 10px;z-index:4}
  .church-site-tour-avatar .avatar-badge{position:absolute;right:1px;bottom:15px;width:23px;height:23px;border-radius:50%;background:#fff;display:grid;place-items:center;color:var(--accent-3,#24537d);font-size:11px;font-weight:900;z-index:5;border:2px solid var(--accent-2,#4da6ff)}
  .church-site-tour-speech{position:relative;flex:1;background:#fff;color:#17212b;border-radius:18px 18px 18px 5px;padding:14px 15px 12px;box-shadow:0 18px 45px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.85)}
  .church-site-tour-speech:before{content:'';position:absolute;left:-8px;bottom:12px;border-width:7px 9px 7px 0;border-style:solid;border-color:transparent #fff transparent transparent}
  .church-site-tour-speech small{display:block;color:var(--accent-3,#24537d);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px}
  .church-site-tour-speech h3{margin:0 0 5px;font-size:17px;line-height:1.2}.church-site-tour-speech p{margin:0;color:#53616b;font-size:12px;line-height:1.48;min-height:36px}
  .church-site-tour-speech .tour-typing{display:inline-block;width:5px;height:13px;margin-left:2px;vertical-align:-2px;background:var(--accent-2,#4da6ff);animation:tourCaret .75s steps(1) infinite}
  .church-site-tour-controls{display:flex;gap:7px;align-items:center;margin-top:11px}.church-site-tour-controls button{border:1px solid #d7e0e5;background:#f7f9fa;color:#26343d;border-radius:9px;padding:8px 11px;font:inherit;font-size:10px;font-weight:800;cursor:pointer}.church-site-tour-controls .tour-next{margin-left:auto;background:var(--accent-3,#24537d);color:#fff;border-color:var(--accent-3,#24537d)}.church-site-tour-progress{font-size:9px;color:#7c8991;font-weight:800;margin-left:auto}.church-site-tour-focus{scroll-margin-top:130px}
  .church-site-tour-guide.guide-right{flex-direction:row-reverse}.church-site-tour-guide.guide-right .church-site-tour-speech{border-radius:18px 18px 5px 18px}.church-site-tour-guide.guide-right .church-site-tour-speech:before{left:auto;right:-8px;border-width:7px 0 7px 9px;border-color:transparent transparent transparent #fff}
  @keyframes ccwIn{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes tourAvatarFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}
  @keyframes tourCaret{50%{opacity:0}}
  @media(max-width:600px){.church-chat-welcome{left:10px;right:10px;bottom:calc(116px + env(safe-area-inset-bottom));width:auto}.church-chat-welcome-bubble{padding:15px;border-radius:18px 18px 7px 18px}.church-chat-welcome-actions{gap:6px}.church-chat-welcome-action{font-size:9.5px}.church-site-tour-guide{left:10px!important;right:10px!important;bottom:12px!important;top:auto!important;width:auto;align-items:flex-end}.church-site-tour-avatar{width:64px;height:82px;flex-basis:64px;transform:scale(.8);transform-origin:bottom center}.church-site-tour-speech{padding:12px}.church-site-tour-speech h3{font-size:15px}.church-site-tour-speech p{font-size:11.5px;min-height:34px}.church-site-tour-controls{margin-top:8px}.church-site-tour-controls button{padding:7px 9px}.church-site-tour-card{bottom:14px}}
  @media(prefers-reduced-motion:reduce){.church-chat-welcome,.church-site-tour-hole,.church-site-tour-guide{animation:none;transition:none!important}.church-chat-welcome-action{transition:none}.church-site-tour-avatar{animation:none}}
  :root[data-site-theme="dark"] .church-chat-welcome-bubble,:root[data-site-theme="dark"] .church-site-tour-speech{background:#111c27;color:#f4f7fa}:root[data-site-theme="dark"] .church-site-tour-speech p{color:#b7c3cc}
  `;
  document.head.appendChild(style);

  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]));
  const logoOf=v=>{if(!v)return'';if(typeof v==='string')return v.trim();if(Array.isArray(v)){for(const x of v){const r=logoOf(x);if(r)return r}}if(typeof v==='object')for(const k of ['url','src','publicUrl','public_url','logoUrl','logo_url','fileUrl','file_url','href','path','logo','image']){const r=logoOf(v[k]);if(r)return r}return''};
  const site=()=>fetch('/api/site/content',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
  const openChat=()=>{const p=document.querySelector('.church-chat-panel');if(p){p.style.display='flex';p.querySelector('.church-chat-input')?.focus();return}const b=document.querySelector('.page .chat,.chat,[aria-label*="chat" i],[title*="chat" i]');if(b&&!b.closest('.church-chat-welcome'))b.click()};

  const steps=[
    {target:'header',title:'Your church navigation',text:'This is your main navigation. I will show you where the most useful areas of the website are.'},
    {target:'#home',title:'Welcome home',text:'The homepage gives you a quick introduction to the church and a starting point for everything else.'},
    {target:'#about',title:'About the church',text:'This area tells the story of the church, its vision and what you can expect when you visit.'},
    {target:'#live',title:'Live worship',text:'When a service is live, this is where you can watch and follow the current worship service.'},
    {target:'#events',title:'Services & events',text:'Here you can discover service times, gatherings, programmes and upcoming church events.'},
    {target:'#media',title:'Media & messages',text:'Find sermons, videos, audio and other media published by the church.'},
    {target:'#resources',title:'Faith & resources',text:'Explore useful resources and classes designed to help you take your next step.'},
    {target:'#visit',title:'Plan your visit',text:'This section helps new and returning visitors find practical information before coming to church.'},
    {target:'#give',title:'Give online',text:'When giving is enabled, this area shows the current giving information configured by the church.'},
    {target:'#contact',title:'Stay connected',text:'Finally, this is where you can find the published ways to contact and connect with the church.'}
  ];

  function findTarget(selector){
    const candidates=[selector];
    if(selector==='#home')candidates.push('#hero','.hero','.hero-section','main > section:first-of-type');
    if(selector==='#about')candidates.push('[id*="about" i]','.about-section','section.about');
    if(selector==='#live')candidates.push('[id*="live" i]','.live-section','a[href*="live" i]');
    if(selector==='#events')candidates.push('[id*="event" i]','.events-section');
    if(selector==='#media')candidates.push('[id*="media" i]','.media-section');
    if(selector==='#resources')candidates.push('[id*="resource" i]','.resources-section');
    if(selector==='#visit')candidates.push('[id*="visit" i]','.visit-section');
    if(selector==='#give')candidates.push('[id*="give" i]','.give-section');
    if(selector==='#contact')candidates.push('[id*="contact" i]','.contact-section');
    for(const q of candidates){try{const el=document.querySelector(q);if(el)return el}catch(_){}}
    return null;
  }

  function startTour(){
    document.querySelector('.church-chat-welcome')?.remove();
    let i=0, previousTarget=null, typingTimer=null;
    const root=document.createElement('div');root.className='church-site-tour';root.innerHTML=`
      <div class="church-site-tour-backdrop"></div>
      <div class="church-site-tour-hole"></div>
      <div class="church-site-tour-guide">
        <div class="church-site-tour-avatar" aria-hidden="true">
          <div class="avatar-head"></div><div class="avatar-hair"></div><div class="avatar-neck"></div>
          <div class="avatar-eye eye-l"></div><div class="avatar-eye eye-r"></div><div class="avatar-smile"></div>
          <div class="avatar-body"></div><div class="avatar-badge">✦</div>
        </div>
        <div class="church-site-tour-speech">
          <small></small><h3></h3><p></p>
          <div class="church-site-tour-controls"><button class="tour-skip">Exit tour</button><button class="tour-back">Back</button><span class="church-site-tour-progress"></span><button class="tour-next">Next</button></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const hole=root.querySelector('.church-site-tour-hole'),guide=root.querySelector('.church-site-tour-guide'),small=root.querySelector('small'),title=root.querySelector('h3'),text=root.querySelector('p'),progress=root.querySelector('.church-site-tour-progress'),back=root.querySelector('.tour-back'),next=root.querySelector('.tour-next');
    let closed=false;
    const cleanupTarget=()=>{if(previousTarget){previousTarget.classList.remove('church-site-tour-targeting');previousTarget=null}};
    const finish=()=>{closed=true;clearTimeout(typingTimer);cleanupTarget();root.remove();document.body.style.removeProperty('overflow');window.removeEventListener('resize',render);window.removeEventListener('scroll',reposition,true)};
    const typeText=(value)=>{clearTimeout(typingTimer);text.textContent='';const caret=document.createElement('span');caret.className='tour-typing';text.appendChild(caret);let n=0;const tick=()=>{if(closed)return;if(n<value.length){text.insertBefore(document.createTextNode(value[n++]),caret);typingTimer=setTimeout(tick,4)}else caret.remove()};tick()};
    function positionGuide(r){
      const vw=innerWidth,vh=innerHeight,gw=Math.min(360,vw-28),gh=125;
      guide.classList.remove('guide-right');
      let left=r.right+18, top=r.top;
      if(left+gw>vw-12){left=Math.max(12,r.left-gw-18);guide.classList.add('guide-right')}
      if(top+gh>vh-18)top=Math.max(12,vh-gh-18);
      if(top<12)top=12;
      if(vw<=600){guide.style.left='10px';guide.style.right='10px';guide.style.top='auto';guide.style.bottom='12px';return}
      guide.style.left=`${left}px`;guide.style.right='auto';guide.style.top=`${top}px`;guide.style.bottom='auto';
    }
    function reposition(){
      const el=findTarget(steps[i].target);if(!el)return;const r=el.getBoundingClientRect(),p=7;
      hole.style.left=`${Math.max(4,r.left-p)}px`;hole.style.top=`${Math.max(4,r.top-p)}px`;hole.style.width=`${Math.max(20,r.width+p*2)}px`;hole.style.height=`${Math.max(20,r.height+p*2)}px`;positionGuide(r);
    }
    function render(){
      if(closed)return;
      cleanupTarget();
      const s=steps[i],el=findTarget(s.target);
      if(!el){if(i<steps.length-1){i++;render()}else finish();return}
      previousTarget=el;el.classList.add('church-site-tour-targeting');el.scrollIntoView({behavior:'smooth',block:'center'});
      small.textContent=`Your guide · ${i+1} of ${steps.length}`;title.textContent=s.title;progress.textContent=`${i+1}/${steps.length}`;back.disabled=i===0;next.textContent=i===steps.length-1?'Finish':'Next';typeText(s.text);
      setTimeout(reposition,120);setTimeout(reposition,520);
    }
    root.querySelector('.church-site-tour-backdrop').onclick=finish;root.querySelector('.tour-skip').onclick=finish;
    back.onclick=()=>{if(i>0){i--;render()}};next.onclick=()=>{if(i<steps.length-1){i++;render()}else finish()};
    window.addEventListener('resize',render);window.addEventListener('scroll',reposition,true);render();
  }

  async function show(){
    if(hidden||shown>=MAX||document.querySelector('.church-chat-welcome'))return;const data=await site();if(hidden||document.querySelector('.church-chat-welcome'))return;shown++;sessionStorage.setItem(countKey(),String(shown));
    const name=String(data?.churchName||'our church').trim()||'our church',logo=logoOf(data?.logo||data?.churchLogo||data?.logoUrl),p=document.createElement('aside');p.className='church-chat-welcome';p.setAttribute('role','dialog');p.innerHTML=`<div class="church-chat-welcome-bubble"><button class="church-chat-welcome-close" type="button" aria-label="Close">×</button><div class="church-chat-welcome-top"><div class="church-chat-welcome-avatar">${logo?`<img src="${esc(logo)}" alt="">`:'✦'}<span class="church-chat-welcome-online"></span></div><div><div class="church-chat-welcome-name">${esc(name)}</div><div class="church-chat-welcome-role">Online · Ready to help</div></div><span class="church-chat-welcome-time">now</span></div><div class="church-chat-welcome-heading">Welcome! 👋</div><div class="church-chat-welcome-text">How would you like to get started? Chat with the church or take a quick tour of the website.</div><div class="church-chat-welcome-actions"><button class="church-chat-welcome-action church-chat-welcome-chat"><span class="ico">💬</span><span>Start Chat</span></button><button class="church-chat-welcome-action church-chat-welcome-tour"><span class="ico">🚀</span><span>Take a Tour</span></button><button class="church-chat-welcome-action church-chat-welcome-exit"><span class="ico">✕</span><span>Exit</span></button></div></div>`;
    document.body.appendChild(p);p.querySelector('.church-chat-welcome-chat').onclick=()=>{openChat();p.remove()};p.querySelector('.church-chat-welcome-tour').onclick=startTour;
    const exit=()=>{hidden=true;sessionStorage.setItem(doneKey(),'done');clearTimeout(timer);p.remove()};p.querySelector('.church-chat-welcome-exit').onclick=exit;p.querySelector('.church-chat-welcome-close').onclick=exit;clearTimeout(timer);timer=setTimeout(()=>p.remove(),15000);if(shown>=MAX)sessionStorage.setItem(doneKey(),'done');
  }
  setTimeout(show,FIRST);function repeat(){if(shown<MAX&&!hidden)setTimeout(()=>{show();repeat()},REPEAT)}setTimeout(repeat,FIRST+20000);
})();
