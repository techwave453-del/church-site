(() => {
  // Personal-looking chat invitations. They follow the live site theme and never block the page.
  const STORAGE_KEY = 'church_chat_welcome_seen';
  const MAX_SHOWS = 3;
  const DISPLAY_MS = 8500;
  const FIRST_DELAY_MS = 3500;
  const REPEAT_DELAY_MS = 42000;

  if (sessionStorage.getItem(STORAGE_KEY) === 'done') return;

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-welcome{position:fixed;right:24px;bottom:158px;z-index:100000;width:min(350px,calc(100vw - 34px));font-family:inherit;cursor:pointer;animation:chatWelcomeIn .55s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 15px 32px var(--accent-shadow,rgba(0,0,0,.25)))}
    .church-chat-welcome-bubble{position:relative;padding:15px 17px 14px 15px;border-radius:18px 18px 5px 18px;background:#fff;color:#17212b;border:1px solid color-mix(in srgb,var(--accent-2,#4da6ff) 22%,#fff);box-shadow:0 8px 26px rgba(0,0,0,.12);overflow:hidden}
    .church-chat-welcome-bubble:before{content:'';position:absolute;left:0;top:0;width:4px;height:100%;background:linear-gradient(180deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff),var(--accent-3,#24537d))}
    .church-chat-welcome-bubble:after{content:'';position:absolute;right:-1px;bottom:-1px;width:17px;height:17px;background:#fff;clip-path:polygon(0 0,100% 100%,0 100%);transform:translateY(1px)}
    .church-chat-welcome-person{display:flex;align-items:center;gap:10px;margin-bottom:10px}
    .church-chat-welcome-avatar{position:relative;width:40px;height:40px;flex:0 0 40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff));color:#fff;font-size:18px;font-weight:800;box-shadow:0 3px 10px var(--accent-shadow,rgba(77,166,255,.25));border:2px solid #fff}
    .church-chat-welcome-online{position:absolute;right:-1px;bottom:0;width:10px;height:10px;border-radius:50%;background:#35b86b;border:2px solid #fff;box-shadow:0 0 0 2px rgba(53,184,107,.16)}
    .church-chat-welcome-name{font-size:12px;font-weight:800;color:var(--accent-3,#24537d);line-height:1.15}.church-chat-welcome-role{font-size:10px;color:#71808c;margin-top:3px}.church-chat-welcome-time{margin-left:auto;align-self:flex-start;font-size:9px;color:#98a3ac;padding-top:2px}
    .church-chat-welcome-text{font-size:13px;line-height:1.5;color:#27343e;padding-left:3px}.church-chat-welcome-text strong{color:var(--accent-3,#24537d)}
    .church-chat-welcome-typing{display:flex;align-items:center;gap:3px;margin:10px 0 0 3px;height:9px}.church-chat-welcome-typing i{display:block;width:5px;height:5px;border-radius:50%;background:var(--accent-2,#4da6ff);animation:chatWelcomeTyping 1.25s ease-in-out infinite}.church-chat-welcome-typing i:nth-child(2){animation-delay:.16s}.church-chat-welcome-typing i:nth-child(3){animation-delay:.32s}
    .church-chat-welcome-cta{display:inline-flex;align-items:center;gap:6px;margin-top:11px;margin-left:3px;padding:7px 11px;border-radius:999px;background:var(--accent-2,#4da6ff);color:#fff;font-size:10px;font-weight:800;letter-spacing:.02em;box-shadow:0 5px 13px var(--accent-shadow,rgba(77,166,255,.25))}.church-chat-welcome-cta span{font-size:13px;line-height:1}
    .church-chat-welcome-close{position:absolute;right:7px;top:7px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(0,0,0,.04);color:#71808c;font-size:16px;line-height:1;cursor:pointer;z-index:3}.church-chat-welcome-close:hover{background:var(--accent-1,#d9ecff);color:var(--accent-3,#24537d)}
    .church-chat-welcome.is-leaving{animation:chatWelcomeOut .4s ease forwards}
    @keyframes chatWelcomeIn{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:none}}
    @keyframes chatWelcomeOut{to{opacity:0;transform:translateY(14px) scale(.96)}}
    @keyframes chatWelcomeTyping{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-3px);opacity:1}}
    :root[data-site-theme="dark"] .church-chat-welcome-bubble{background:#111c27;color:#f8fafc;border-color:color-mix(in srgb,var(--accent-2,#4da6ff) 28%,#111c27);box-shadow:0 12px 32px rgba(0,0,0,.45)}
    :root[data-site-theme="dark"] .church-chat-welcome-bubble:after{background:#111c27}.church-chat-welcome-bubble:before{background:linear-gradient(180deg,var(--accent-1,#d9ecff),var(--accent-2,#4da6ff),var(--accent-3,#24537d))}
    :root[data-site-theme="dark"] .church-chat-welcome-name,:root[data-site-theme="dark"] .church-chat-welcome-text{color:#f8fafc}:root[data-site-theme="dark"] .church-chat-welcome-role,:root[data-site-theme="dark"] .church-chat-welcome-time{color:#9fb0bf}:root[data-site-theme="dark"] .church-chat-welcome-close{background:rgba(255,255,255,.07);color:#cbd5e1}
    @media(max-width:600px){.church-chat-welcome{right:12px;bottom:142px;width:calc(100vw - 24px)}.church-chat-welcome-bubble{border-radius:17px 17px 5px 17px;padding:13px 14px 13px 13px}.church-chat-welcome-avatar{width:37px;height:37px;flex-basis:37px}.church-chat-welcome-text{font-size:12px}.church-chat-welcome-cta{margin-top:9px}}
    @media(prefers-reduced-motion:reduce){.church-chat-welcome,.church-chat-welcome-typing i{animation:none!important}}
  `;
  document.head.appendChild(style);

  let shown = Number(sessionStorage.getItem('church_chat_welcome_count') || 0);
  let timer = null;
  let hiddenByUser = false;

  function getChurchName() {
    return fetch('/api/site/content', { headers:{Accept:'application/json'}, cache:'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then(site => String(site?.churchName || 'our church').trim() || 'our church')
      .catch(() => 'our church');
  }

  function findChatLauncher() {
    return document.querySelector('.page .chat') || document.querySelector('[aria-label*="chat" i]') || document.querySelector('[title*="chat" i]') || document.querySelector('button[class*="chat" i]');
  }

  function openChat() {
    const panel = document.querySelector('.church-chat-panel');
    if (panel) { panel.style.display = 'flex'; panel.querySelector('.church-chat-input')?.focus(); return; }
    findChatLauncher()?.click();
  }

  function removePopup(popup) {
    if (!popup || popup.classList.contains('is-leaving')) return;
    popup.classList.add('is-leaving');
    setTimeout(() => popup.remove(), 420);
  }

  async function showPopup() {
    if (hiddenByUser || shown >= MAX_SHOWS || document.querySelector('.church-chat-welcome')) return;
    shown += 1;
    sessionStorage.setItem('church_chat_welcome_count', String(shown));
    const church = await getChurchName();
    if (hiddenByUser || document.querySelector('.church-chat-welcome')) return;

    const popup = document.createElement('aside');
    popup.className = 'church-chat-welcome';
    popup.setAttribute('role','status');
    popup.setAttribute('aria-label','Personal chat invitation');
    popup.innerHTML = `<div class="church-chat-welcome-bubble"><div class="church-chat-welcome-person"><div class="church-chat-welcome-avatar">✦<span class="church-chat-welcome-online"></span></div><div><div class="church-chat-welcome-name">Church Team</div><div class="church-chat-welcome-role">We're here to help</div></div><span class="church-chat-welcome-time">now</span></div><div class="church-chat-welcome-text">Hi! 👋 Welcome to <strong>${church}</strong>. If you'd like to know more about our services, events, prayer, giving or visiting, just send us a message. We'd be happy to hear from you. 🙏</div><div class="church-chat-welcome-typing" aria-hidden="true"><i></i><i></i><i></i></div><span class="church-chat-welcome-cta">Chat with us <span>›</span></span><button class="church-chat-welcome-close" type="button" aria-label="Dismiss chat invitation">×</button></div>`;
    document.body.appendChild(popup);

    popup.addEventListener('click', event => {
      if (event.target.closest('.church-chat-welcome-close')) return;
      openChat();
      removePopup(popup);
    });
    popup.querySelector('.church-chat-welcome-close').addEventListener('click', event => {
      event.stopPropagation();
      hiddenByUser = true;
      sessionStorage.setItem(STORAGE_KEY,'done');
      removePopup(popup);
    });

    clearTimeout(timer);
    timer = setTimeout(() => removePopup(popup), DISPLAY_MS);
    if (shown >= MAX_SHOWS) sessionStorage.setItem(STORAGE_KEY,'done');
  }

  setTimeout(showPopup, FIRST_DELAY_MS);
  const repeat = () => {
    if (shown < MAX_SHOWS && !hiddenByUser) setTimeout(() => { showPopup(); repeat(); }, REPEAT_DELAY_MS);
  };
  setTimeout(repeat, FIRST_DELAY_MS + DISPLAY_MS + 3000);
})();
