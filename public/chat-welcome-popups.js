(() => {
  // Friendly, lightweight chat invitations. They appear briefly and never block the page.
  const STORAGE_KEY = 'church_chat_welcome_seen';
  const MAX_SHOWS = 3;
  const DISPLAY_MS = 8500;
  const FIRST_DELAY_MS = 3500;
  const REPEAT_DELAY_MS = 42000;

  if (sessionStorage.getItem(STORAGE_KEY) === 'done') return;

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-welcome{position:fixed;right:24px;bottom:158px;z-index:100000;width:min(340px,calc(100vw - 34px));padding:16px 18px 15px;border-radius:20px;background:linear-gradient(135deg,#0b3028,#286451 58%,var(--accent-2,#4da6ff));color:#fff;box-shadow:0 18px 55px rgba(0,0,0,.28),0 0 0 1px rgba(255,255,255,.14);font-family:inherit;cursor:pointer;animation:chatWelcomeIn .55s cubic-bezier(.2,.8,.2,1);overflow:hidden}
    .church-chat-welcome:before{content:'';position:absolute;width:120px;height:120px;right:-38px;top:-55px;border-radius:50%;background:rgba(255,255,255,.13);animation:chatWelcomePulse 3s ease-in-out infinite}
    .church-chat-welcome:after{content:'✦';position:absolute;right:17px;top:12px;font-size:17px;color:rgba(255,255,255,.75);animation:chatWelcomeSpark 2.2s ease-in-out infinite}
    .church-chat-welcome-inner{position:relative;display:flex;align-items:flex-start;gap:12px}
    .church-chat-welcome-icon{width:42px;height:42px;flex:0 0 42px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.16);font-size:21px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
    .church-chat-welcome-title{font-weight:800;font-size:14px;line-height:1.25;margin:1px 26px 4px 0}.church-chat-welcome-text{font-size:12px;line-height:1.5;color:rgba(255,255,255,.92)}
    .church-chat-welcome-cta{display:inline-flex;align-items:center;gap:5px;margin-top:9px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.15);font-size:10px;font-weight:800;letter-spacing:.03em}
    .church-chat-welcome-close{position:absolute;right:8px;bottom:7px;width:25px;height:25px;border:0;border-radius:50%;background:transparent;color:rgba(255,255,255,.8);font-size:17px;cursor:pointer;z-index:2}.church-chat-welcome-close:hover{background:rgba(255,255,255,.12);color:#fff}
    .church-chat-welcome.is-leaving{animation:chatWelcomeOut .4s ease forwards}
    @keyframes chatWelcomeIn{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:none}}
    @keyframes chatWelcomeOut{to{opacity:0;transform:translateY(14px) scale(.96)}}
    @keyframes chatWelcomePulse{0%,100%{transform:scale(.85);opacity:.35}50%{transform:scale(1.12);opacity:.7}}
    @keyframes chatWelcomeSpark{0%,100%{transform:rotate(0) scale(1);opacity:.55}50%{transform:rotate(18deg) scale(1.2);opacity:1}}
    @media(max-width:600px){.church-chat-welcome{right:12px;bottom:142px;width:calc(100vw - 24px);border-radius:18px;padding:14px 15px}.church-chat-welcome-icon{width:38px;height:38px;flex-basis:38px;font-size:19px}.church-chat-welcome-title{font-size:13px}.church-chat-welcome-text{font-size:11.5px}}
    @media(prefers-reduced-motion:reduce){.church-chat-welcome,.church-chat-welcome:before,.church-chat-welcome:after{animation:none!important}}
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
    return document.querySelector('.page .chat') ||
      document.querySelector('[aria-label*="chat" i]') ||
      document.querySelector('[title*="chat" i]') ||
      document.querySelector('button[class*="chat" i]');
  }

  function openChat() {
    const panel = document.querySelector('.church-chat-panel');
    if (panel) {
      panel.style.display = 'flex';
      panel.querySelector('.church-chat-input')?.focus();
      return;
    }
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
    popup.setAttribute('aria-label','Chat invitation');
    popup.innerHTML = `<div class="church-chat-welcome-inner"><div class="church-chat-welcome-icon">💬</div><div><div class="church-chat-welcome-title">Need a little help? You're welcome here. 👋</div><div class="church-chat-welcome-text">Ask about services, events, ministries, prayer, giving, visiting or anything you would like to know about ${church}.</div><span class="church-chat-welcome-cta">Start a conversation&nbsp; →</span></div></div><button class="church-chat-welcome-close" type="button" aria-label="Dismiss chat invitation">×</button>`;
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
