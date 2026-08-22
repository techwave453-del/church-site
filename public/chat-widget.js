(() => {
  const state = { open: false, loading: false, messages: [], site: null };
  const NAME_KEY = 'church_chat_name';

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-panel{position:fixed;right:22px;bottom:92px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 120px));z-index:99999;background:#fff;border-radius:20px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(0,0,0,.08);font-family:inherit}
    .church-chat-header{padding:16px 18px;background:linear-gradient(135deg,#173f35,#286451);color:#fff;display:flex;align-items:center;justify-content:space-between}
    .church-chat-title{display:flex;align-items:center;gap:10px}.church-chat-title-icon{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:19px}.church-chat-title strong{display:block;font-size:15px}.church-chat-title small{display:block;opacity:.8;font-size:11px;margin-top:2px}
    .church-chat-close{border:0;background:transparent;color:#fff;font-size:25px;line-height:1;cursor:pointer;padding:5px}
    .church-chat-messages{flex:1;overflow:auto;padding:16px;background:#f6f8f7;display:flex;flex-direction:column;gap:9px}
    .church-chat-message{max-width:84%;padding:10px 12px;border-radius:16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07);align-self:flex-start}.church-chat-message.mine{align-self:flex-end;background:#dff2e9}.church-chat-message.bot{background:#fff;border:1px solid #e1e9e5}.church-chat-message .meta{font-size:10px;opacity:.58;margin-bottom:4px}.church-chat-message .body{font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
    .church-chat-empty{text-align:center;margin:auto;color:#66736e;font-size:13px;line-height:1.5;padding:20px}.church-chat-status{padding:7px 14px;font-size:11px;color:#8a3f2e;background:#fff3ef;border-top:1px solid #f0ddd6}
    .church-chat-suggestions{display:flex;gap:6px;overflow:auto;padding:8px 10px 2px;background:#fff;border-top:1px solid #e7ebe9}.church-chat-suggestion{white-space:nowrap;border:1px solid #cbd9d3;background:#f7faf8;color:#235846;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}.church-chat-suggestion:hover{background:#eaf3ee}
    .church-chat-form{padding:10px;background:#fff;border-top:1px solid #e7ebe9}.church-chat-name{width:100%;box-sizing:border-box;border:1px solid #d9e0dd;border-radius:10px;padding:9px 10px;margin-bottom:8px;font:inherit;font-size:12px;outline:none}.church-chat-row{display:flex;gap:8px}.church-chat-input{flex:1;resize:none;min-height:42px;max-height:100px;border:1px solid #d9e0dd;border-radius:12px;padding:10px;font:inherit;font-size:13px;outline:none}.church-chat-input:focus,.church-chat-name:focus{border-color:#286451}.church-chat-send{width:44px;border:0;border-radius:12px;background:#286451;color:#fff;cursor:pointer;font-size:18px}.church-chat-send:disabled{opacity:.5;cursor:not-allowed}.church-chat-note{font-size:10px;color:#7a8580;padding:6px 2px 0}
    @media(max-width:600px){.church-chat-panel{right:10px;bottom:82px;width:calc(100vw - 20px);height:min(620px,calc(100vh - 100px));border-radius:18px}.church-chat-messages{padding:13px}}
  `;
  document.head.appendChild(style);

  function escText(value) { return String(value ?? ''); }
  function getName() { return localStorage.getItem(NAME_KEY) || ''; }
  function setName(value) { localStorage.setItem(NAME_KEY, value.trim().slice(0, 60)); }

  function createPanel() {
    if (document.querySelector('.church-chat-panel')) return document.querySelector('.church-chat-panel');
    const panel = document.createElement('section');
    panel.className = 'church-chat-panel';
    panel.setAttribute('aria-label', 'Church assistant chat');
    panel.innerHTML = `
      <div class="church-chat-header">
        <div class="church-chat-title"><span class="church-chat-title-icon">🤖</span><div><strong>Church Assistant</strong><small>Quick answers &amp; help — available anytime</small></div></div>
        <button class="church-chat-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="church-chat-messages"><div class="church-chat-empty">Welcome! 👋<br>I can help with services, visiting, prayer, ministries, giving, live worship and getting connected. 🙏</div></div>
      <div class="church-chat-status" hidden></div>
      <div class="church-chat-suggestions">
        <button type="button" class="church-chat-suggestion" data-question="What time are the services?">Service times</button>
        <button type="button" class="church-chat-suggestion" data-question="I'm new here. How can I visit?">I'm new here</button>
        <button type="button" class="church-chat-suggestion" data-question="How can I contact the church?">Contact</button>
        <button type="button" class="church-chat-suggestion" data-question="How can I request prayer?">Prayer</button>
      </div>
      <form class="church-chat-form">
        <input class="church-chat-name" maxlength="60" placeholder="Your name" autocomplete="name" />
        <div class="church-chat-row"><textarea class="church-chat-input" maxlength="500" placeholder="Ask us a question…" rows="1" required></textarea><button class="church-chat-send" type="submit" aria-label="Send message">➤</button></div>
        <div class="church-chat-note">Answers are based on the church information published on this website. 🙏</div>
      </form>`;
    document.body.appendChild(panel);
    panel.querySelector('.church-chat-name').value = getName();
    panel.querySelector('.church-chat-close').addEventListener('click', close);
    panel.querySelector('.church-chat-form').addEventListener('submit', sendMessage);
    panel.querySelectorAll('.church-chat-suggestion').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
    const input = panel.querySelector('.church-chat-input');
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); panel.querySelector('form').requestSubmit(); } });
    return panel;
  }

  function setStatus(message) {
    const el = document.querySelector('.church-chat-status');
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
  }

  function addMessage(name, text, type = 'bot') {
    state.messages.push({ name, text, type, created_at: new Date().toISOString() });
    renderMessages();
  }

  function renderMessages() {
    const panel = createPanel();
    const box = panel.querySelector('.church-chat-messages');
    if (!state.messages.length) {
      box.innerHTML = '<div class="church-chat-empty">Welcome! 👋</div>';
      return;
    }
    box.innerHTML = '';
    state.messages.forEach(message => {
      const item = document.createElement('div');
      item.className = 'church-chat-message' + (message.type === 'user' ? ' mine' : ' bot');
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${escText(message.name)} · ${formatTime(message.created_at)}`;
      const body = document.createElement('div'); body.className = 'body'; body.textContent = escText(message.text);
      item.append(meta, body); box.appendChild(item);
    });
    box.scrollTop = box.scrollHeight;
  }

  function formatTime(value) {
    try { return new Date(value).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch (_) { return ''; }
  }

  async function loadSite() {
    if (state.site) return state.site;
    try {
      const response = await fetch('/api/site/content', {headers:{Accept:'application/json'}});
      if (response.ok) state.site = await response.json();
    } catch (_) {}
    return state.site || {};
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function containsAny(text, words) { return words.some(word => text.includes(word)); }

  function answerQuestion(question, site) {
    const q = normalize(question);
    const church = site.churchName || 'our church';
    if (!q) return 'Please type a question and I’ll do my best to help. 😊';

    if (containsAny(q, ['hello','hi','hey','good morning','good afternoon','good evening'])) {
      return `Hello! 👋 Welcome to ${church}. How can I help you today? You can ask about services, visiting, prayer, ministries, giving, live worship or contacting the church.`;
    }

    if (containsAny(q, ['service time','service times','when is service','what time','worship time','sunday service'])) {
      const services = Array.isArray(site.services) ? site.services : [];
      if (services.length) return `Here are the current service times:\n\n${services.map(s => `• ${s.title}: ${s.time}`).join('\n')}\n\nWe’d love to worship with you! 🙏`;
      return 'Please check the Service Times section of the website for the latest schedule.';
    }

    if (containsAny(q, ['new here','first time','first visit','visit','visitor','visiting','come to church'])) {
      return `Welcome! ❤️ ${site.aboutText ? site.aboutText : `We’re glad you’re considering visiting ${church}.`}\n\nStart with the “I’m New Here” section on the website, or ask me how to contact the church. We’d be happy to welcome you!`;
    }

    if (containsAny(q, ['contact','phone','telephone','email','call','reach you','reach the church'])) {
      const phone = site.phone || 'the church phone number';
      const email = site.email || 'the church email address';
      return `You can contact ${church} through:\n\n📞 ${phone}\n✉️ ${email}\n\nWe’ll be happy to help you. 😊`;
    }

    if (containsAny(q, ['pray','prayer','prayer request','need prayer','request prayer'])) {
      return 'We would be honoured to pray with you. 🙏 Please use the prayer/contact option on the website to send your request, or contact the church directly. Your request can be shared with the appropriate ministry team.';
    }

    if (containsAny(q, ['give','giving','offering','tithe','donate','donation','financial'])) {
      return 'Thank you for your heart to give. ❤️ Please use the Giving section on the website for the church’s current giving instructions. If you need help with a giving method, contact the church directly.';
    }

    if (containsAny(q, ['ministry','ministries','serve','volunteer','join ministry','department'])) {
      return 'We’d love to help you get connected and serve. 🤝 Please explore the ministries and “I’m New Here” sections of the website, or contact the church so the right ministry can assist you.';
    }

    if (containsAny(q, ['live','livestream','live stream','watch online','online service'])) {
      const live = site.liveStream || {};
      if (live.enabled && live.url) return `${live.title || 'Live Worship Service'} is available here:\n${live.url}\n\n${live.description || 'Join us online for worship, the Word and fellowship. 🙏'}`;
      return 'The live stream is not currently available. Please check the Live page again when a service is scheduled. 🙏';
    }

    if (containsAny(q, ['event','events','program','programs','upcoming'])) {
      return 'For current programs and events, please open the Events/Upcoming Programs section of the website. That information can change, so the website is the best place to see the latest schedule. 📅';
    }

    if (containsAny(q, ['membership','foundation class','maturity class','class'])) {
      const classes = Array.isArray(site.membershipClasses) ? site.membershipClasses : [];
      if (classes.length) return `Our current faith and membership classes include:\n\n${classes.map(c => `• ${c.title}`).join('\n')}\n\nUse the registration/contact option on the website to get started. 🙌`;
      return 'Please check the Faith & Membership Classes section for current classes and registration information.';
    }

    if (containsAny(q, ['about','who are you','what is the church','belief','believe'])) {
      return site.aboutText || `${church} is a community committed to worship, fellowship, the Word of God, prayer, service and sharing the Gospel.`;
    }

    if (containsAny(q, ['location','where are you','address','directions','branch'])) {
      return 'For the latest location and branch information, please open the “Find a Branch” section of the website. If you need help finding the church, contact us and someone will assist you.';
    }

    return `I’m sorry, I don’t have a reliable answer for that yet. 🙏 I can help with service times, visiting the church, prayer, ministries, giving, live worship, membership classes and contact information.\n\nFor anything else, please contact ${church} directly so a member of the team can help you.`;
  }

  async function ask(question) {
    if (state.loading) return;
    const panel = createPanel();
    const nameInput = panel.querySelector('.church-chat-name');
    const name = nameInput.value.trim() || 'Visitor';
    setName(name);
    state.loading = true;
    panel.querySelector('.church-chat-send').disabled = true;
    const input = panel.querySelector('.church-chat-input');
    addMessage(name, question, 'user');
    input.value = '';
    setStatus('Thinking…');
    try {
      const site = await loadSite();
      await new Promise(resolve => setTimeout(resolve, 250));
      addMessage('Church Assistant', answerQuestion(question, site), 'bot');
      setStatus('');
    } catch (_) {
      addMessage('Church Assistant', 'I’m having trouble loading the church information right now. Please contact the church directly for assistance. 🙏', 'bot');
      setStatus('');
    } finally {
      state.loading = false;
      panel.querySelector('.church-chat-send').disabled = false;
      input.focus();
    }
  }

  function sendMessage(event) {
    event.preventDefault();
    if (state.loading) return;
    const panel = createPanel();
    const input = panel.querySelector('.church-chat-input');
    const question = input.value.trim();
    if (!question) return;
    ask(question);
  }

  function open() {
    const panel = createPanel();
    panel.style.display = 'flex';
    state.open = true;
    loadSite();
  }
  function close() {
    const panel = document.querySelector('.church-chat-panel');
    if (panel) panel.style.display = 'none';
    state.open = false;
  }

  document.addEventListener('click', event => {
    const bubble = event.target.closest?.('.chat');
    if (!bubble) return;
    event.preventDefault();
    event.stopPropagation();
    open();
  }, true);
})();
