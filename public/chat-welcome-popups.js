(() => {
  const STORAGE_KEY = 'church_chat_welcome_seen_v2';
  const MAX_SHOWS = 3;
  const DISPLAY_MS = 10000;
  const FIRST_DELAY_MS = 3500;
  const REPEAT_DELAY_MS = 48000;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const deviceKey = () => isMobile() ? 'mobile' : 'desktop';
  const countKey = () => `${STORAGE_KEY}_count_${deviceKey()}`;
  const doneKey = () => `${STORAGE_KEY}_${deviceKey()}`;

  if (sessionStorage.getItem(doneKey()) === 'done') return;

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-welcome{
      position:fixed!important;right:24px!important;bottom:158px!important;z-index:2147483000!important;
      width:min(365px,calc(100vw - 34px))!important;display:block!important;visibility:visible!important;
      opacity:1;font-family:inherit;cursor:pointer;pointer-events:auto!important;
      animation:chatWelcomeIn .52s cubic-bezier(.2,.85,.2,1);filter:drop-shadow(0 16px 34px var(--accent-shadow,rgba(0,0,0,.22)));
    }
    .church-chat-welcome-bubble{
      position:relative;padding:16px 17px 15px;border-radius:20px 20px 6px 20px;
      background:var(--chat-welcome-bg,#fff);color:#17212b;
      border:1px solid color-mix(in srgb,var(--accent-2,#4da6ff) 18%,#fff);
      box-shadow:0 10px 30px rgba(0,0,0,.11);overflow:hidden;
    }
    .church-chat-welcome-bubble:before{content:'';position:absolute;left:0;top:0;width:4px;height:100%;background:linear-gradient(180deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff),var(--accent-3,#24537d));}
    .church-chat-welcome-bubble:after{content:'';position:absolute;right:-1px;bottom:-1px;width:18px;height:18px;background:var(--chat-welcome-bg,#fff);clip-path:polygon(0 0,100% 100%,0 100%);transform:translateY(1px);}
    .church-chat-welcome-top{display:flex;align-items:center;gap:10px;padding-right:24px;margin-bottom:12px}
    .church-chat-welcome-avatar{position:relative;width:42px;height:42px;flex:0 0 42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff));color:#fff;font-size:18px;font-weight:800;box-shadow:0 4px 12px var(--accent-shadow,rgba(77,166,255,.24));border:2px solid #fff;overflow:hidden;}
    .church-chat-welcome-avatar img{width:100%;height:100%;object-fit:cover;display:block}
    .church-chat-welcome-online{position:absolute;right:-1px;bottom:0;width:10px;height:10px;border-radius:50%;background:#2fb86b;border:2px solid #fff;z-index:2}
    .church-chat-welcome-name{font-size:12px;font-weight:800;color:var(--accent-3,#24537d);line-height:1.15}
    .church-chat-welcome-role{font-size:10px;color:#71808c;margin-top:3px}
    .church-chat-welcome-time{margin-left:auto;align-self:flex-start;font-size:9px;color:#98a3ac;padding-top:2px}
    .church-chat-welcome-close{position:absolute;right:8px;top:8px;width:25px;height:25px;border:0;border-radius:50%;background:rgba(0,0,0,.045);color:#71808c;font-size:17px;line-height:1;cursor:pointer;z-index:4;}
    .church-chat-welcome-close:hover{background:rgba(0,0,0,.09)}
    .church-chat-welcome-heading{font-size:15px;font-weight:800;color:#18242c;margin:0 0 5px 3px;letter-spacing:-.1px}
    .church-chat-welcome-text{font-size:12.5px;line-height:1.55;color:#3a4650;padding-left:3px;max-width:330px}
    .church-chat-welcome-text strong{color:var(--accent-3,#24537d)}
    .church-chat-welcome-actions{display:flex;align-items:center;gap:9px;margin:13px 0 0 3px}
    .church-chat-welcome-cta{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 13px;border-radius:999px;background:linear-gradient(135deg,var(--accent-2,#4da6ff),var(--accent-3,#24537d));color:#fff;font-size:10.5px;font-weight:800;box-shadow:0 6px 14px var(--accent-shadow,rgba(77,166,255,.23));}
    .church-chat-welcome-cta span{font-size:14px;line-height:1;transition:transform .2s ease}.church-chat-welcome:hover .church-chat-welcome-cta span{transform:translateX(2px)}
    .church-chat-welcome-later{font-size:10px;color:#7a8790;font-weight:700}
    .church-chat-welcome-typing{display:flex;align-items:center;gap:3px;margin:10px 0 0 3px;height:7px}
    .church-chat-welcome-typing i{display:block;width:4px;height:4px;border-radius:50%;background:var(--accent-2,#4da6ff);animation:chatWelcomeTyping 1.25s ease-in-out infinite}
    .church-chat-welcome-typing i:nth-child(2){animation-delay:.16s}.church-chat-welcome-typing i:nth-child(3){animation-delay:.32s}
    .church-chat-welcome.is-leaving{animation:chatWelcomeOut .36s ease forwards}
    @keyframes chatWelcomeIn{from{opacity:0;transform:translateY(18px) scale(.95)}to{opacity:1;transform:none}}
    @keyframes chatWelcomeOut{to{opacity:0;transform:translateY(12px) scale(.97)}}
    @keyframes chatWelcomeTyping{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-3px);opacity:1}}
    :root[data-site-theme="dark"] .church-chat-welcome-bubble{--chat-welcome-bg:#111c27;color:#f8fafc;border-color:color-mix(in srgb,var(--accent-2,#4da6ff) 28%,#111c27);box-shadow:0 14px 38px rgba(0,0,0,.45)}
    :root[data-site-theme="dark"] .church-chat-welcome-bubble:after{background:#111c27}
    :root[data-site-theme="dark"] .church-chat-welcome-heading,:root[data-site-theme="dark"] .church-chat-welcome-text{color:#f4f7fa}
    :root[data-site-theme="dark"] .church-chat-welcome-name{color:#bfe0ff}
    :root[data-site-theme="dark"] .church-chat-welcome-role,:root[data-site-theme="dark"] .church-chat-welcome-time,:root[data-site-theme="dark"] .church-chat-welcome-later{color:#9fb0bf}
    :root[data-site-theme="dark"] .church-chat-welcome-close{background:rgba(255,255,255,.07);color:#cbd5e1}
    @media(max-width:600px){.church-chat-welcome{right:10px!important;left:10px!important;bottom:calc(116px + env(safe-area-inset-bottom))!important;width:auto!important;max-width:none!important}.church-chat-welcome-bubble{border-radius:18px 18px 6px 18px;padding:14px 14px 13px}.church-chat-welcome-avatar{width:38px;height:38px;flex-basis:38px}.church-chat-welcome-heading{font-size:14px}.church-chat-welcome-text{font-size:12px}.church-chat-welcome-actions{margin-top:11px}}
    @media(prefers-reduced-motion:reduce){.church-chat-welcome,.church-chat-welcome-typing i{animation:none!important}.church-chat-welcome-cta span{transition:none}}
  `;
  document.head.appendChild(style);

  let shown = Number(sessionStorage.getItem(countKey()) || 0);
  let timer = null;
  let hiddenByUser = false;

  function resolveLogo(value){
    if(!value)return '';
    if(typeof value==='string')return value.trim();
    if(Array.isArray(value)){for(const item of value){const found=resolveLogo(item);if(found)return found;}return '';}
    if(typeof value==='object'){for(const key of ['url','src','publicUrl','public_url','logoUrl','logo_url','fileUrl','file_url','href','path','logo','image','thumbnail','value']){const found=resolveLogo(value[key]);if(found)return found;}}
    return '';
  }

  function getSite(){return fetch('/api/site/content',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}));}
  function findChatLauncher(){return document.querySelector('.page .chat')||document.querySelector('[aria-label*="chat" i]')||document.querySelector('[title*="chat" i]')||document.querySelector('button[class*="chat" i]');}
  function openChat(){const panel=document.querySelector('.church-chat-panel');if(panel){panel.style.display='flex';panel.querySelector('.church-chat-input')?.focus();return;}findChatLauncher()?.click();}
  function removePopup(popup){if(!popup||popup.classList.contains('is-leaving'))return;popup.classList.add('is-leaving');setTimeout(()=>popup.remove(),380);}
  function escapeHtml(value){return String(value??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[ch]));}

  async function showPopup(){
    if(hiddenByUser||shown>=MAX_SHOWS||document.querySelector('.church-chat-welcome'))return;
    const site=await getSite();
    if(hiddenByUser||document.querySelector('.church-chat-welcome'))return;
    shown++;sessionStorage.setItem(countKey(),String(shown));
    const church=String(site?.churchName||'our church').trim()||'our church';
    const logo=resolveLogo(site?.logo||site?.churchLogo||site?.logoUrl);
    const messages=[
      {heading:'Need a little help?',text:`Hi! 👋 Welcome to <strong>${escapeHtml(church)}</strong>. Have a question about visiting, services, prayer, giving or anything else? We’re here for you.`,cta:'Chat with us'},
      {heading:'We’re glad you’re here 👋',text:`If this is your first time visiting <strong>${escapeHtml(church)}</strong>, feel free to ask us anything. We’d love to help you feel at home.`,cta:'Talk to us'},
      {heading:'Can we help you today?',text:`Whether you need service times, directions, prayer or more information about <strong>${escapeHtml(church)}</strong>, just start a conversation. 🙏`,cta:'Start a chat'}
    ];
    const message=messages[Math.min(shown-1,messages.length-1)];
    const popup=document.createElement('aside');
    popup.className='church-chat-welcome';popup.setAttribute('role','dialog');popup.setAttribute('aria-label','Church chat invitation');
    popup.innerHTML=`<div class="church-chat-welcome-bubble"><button class="church-chat-welcome-close" type="button" aria-label="Close chat invitation">×</button><div class="church-chat-welcome-top"><div class="church-chat-welcome-avatar">${logo?`<img src="${escapeHtml(logo)}" alt="">`:'✦'}<span class="church-chat-welcome-online"></span></div><div><div class="church-chat-welcome-name">Church Team</div><div class="church-chat-welcome-role">Online · Ready to help</div></div><span class="church-chat-welcome-time">now</span></div><div class="church-chat-welcome-heading">${message.heading}</div><div class="church-chat-welcome-text">${message.text}</div><div class="church-chat-welcome-typing" aria-hidden="true"><i></i><i></i><i></i></div><div class="church-chat-welcome-actions"><span class="church-chat-welcome-cta">${message.cta} <span>›</span></span><span class="church-chat-welcome-later">or close for now</span></div></div>`;
    document.body.appendChild(popup);
    popup.addEventListener('click',e=>{if(e.target.closest('.church-chat-welcome-close'))return;openChat();removePopup(popup);});
    popup.querySelector('.church-chat-welcome-close').addEventListener('click',e=>{e.stopPropagation();hiddenByUser=true;sessionStorage.setItem(doneKey(),'done');removePopup(popup);});
    clearTimeout(timer);timer=setTimeout(()=>removePopup(popup),DISPLAY_MS);
    if(shown>=MAX_SHOWS)sessionStorage.setItem(doneKey(),'done');
  }

  setTimeout(showPopup,FIRST_DELAY_MS);
  function scheduleRepeat(){if(shown<MAX_SHOWS&&!hiddenByUser){setTimeout(()=>{showPopup();scheduleRepeat();},REPEAT_DELAY_MS);}}
  setTimeout(scheduleRepeat,FIRST_DELAY_MS+DISPLAY_MS+4000);
})();
