(() => {
  const state = { open: false, loading: false, messages: [], site: null };
  const NAME_KEY = 'church_chat_name';
  const MAX_MESSAGE_LENGTH = 500;

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
      <div class="church-chat-header"><div class="church-chat-title"><span class="church-chat-title-icon">🤖</span><div><strong>Church Assistant</strong><small>Quick answers &amp; help — available anytime</small></div></div><button class="church-chat-close" type="button" aria-label="Close chat">×</button></div>
      <div class="church-chat-messages"><div class="church-chat-empty">Welcome! 👋<br>I can help with services, visiting, prayer, ministries, giving, live worship and getting connected. 🙏</div></div>
      <div class="church-chat-status" hidden></div>
      <div class="church-chat-suggestions">
        <button type="button" class="church-chat-suggestion" data-question="When is the next church service and what time does it start?">Service times</button>
        <button type="button" class="church-chat-suggestion" data-question="I'm visiting for the first time. What should I know?">I'm new here</button>
        <button type="button" class="church-chat-suggestion" data-question="What's the best way to contact the church?">Contact</button>
        <button type="button" class="church-chat-suggestion" data-question="I'd like someone to pray with me. How do I send a prayer request?">Prayer</button>
      </div>
      <form class="church-chat-form"><input class="church-chat-name" maxlength="60" placeholder="Your name" autocomplete="name" /><div class="church-chat-row"><textarea class="church-chat-input" maxlength="500" placeholder="Ask us a question…" rows="1" required></textarea><button class="church-chat-send" type="submit" aria-label="Send message">➤</button></div><div class="church-chat-note">Answers are based on the church information published on this website. 🙏</div></form>`;
    document.body.appendChild(panel);
    panel.querySelector('.church-chat-name').value = getName();
    panel.querySelector('.church-chat-close').addEventListener('click', close);
    panel.querySelector('.church-chat-form').addEventListener('submit', sendMessage);
    panel.querySelectorAll('.church-chat-suggestion').forEach(button => button.addEventListener('click', () => ask(button.dataset.question)));
    const input = panel.querySelector('.church-chat-input');
    input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); panel.querySelector('form').requestSubmit(); } });
    return panel;
  }

  function setStatus(message) { const el = document.querySelector('.church-chat-status'); if (!el) return; el.textContent = message || ''; el.hidden = !message; }
  function addMessage(name, text, type = 'bot') { state.messages.push({ name, text, type, created_at: new Date().toISOString() }); renderMessages(); }
  function renderMessages() {
    const panel = createPanel(), box = panel.querySelector('.church-chat-messages');
    if (!state.messages.length) { box.innerHTML = '<div class="church-chat-empty">Welcome! 👋</div>'; return; }
    box.innerHTML = '';
    state.messages.forEach(message => { const item = document.createElement('div'); item.className = 'church-chat-message' + (message.type === 'user' ? ' mine' : ' bot'); const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${escText(message.name)} · ${formatTime(message.created_at)}`; const body = document.createElement('div'); body.className = 'body'; body.textContent = escText(message.text); item.append(meta, body); box.appendChild(item); });
    box.scrollTop = box.scrollHeight;
  }
  function formatTime(value) { try { return new Date(value).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch (_) { return ''; } }
  async function loadSite() { if (state.site) return state.site; try { const response = await fetch('/api/site/content', {headers:{Accept:'application/json'}}); if (response.ok) state.site = await response.json(); } catch (_) {} return state.site || {}; }

  // Converts everyday phrasing into stable tokens. This lets the assistant understand
  // things like "when do you meet", "what time is worship", and "Sunday schedule"
  // without requiring an exact phrase match.
  function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const WORDS = {
    greeting: ['hello','hi','hey','good morning','good afternoon','good evening','how are you'],
    service: ['service','services','worship','worship service','church service','sunday service','sunday worship','meeting','meet','gathering','gatherings','schedule','church times','service times','worship times'],
    time: ['time','times','when','schedule','start','starts','begin','begins','what hour','hour'],
    newHere: ['new here','new to the church','first time','first visit','first timer','first-timer','visitor','visiting','visit','coming for the first time','joining you','join you','come to church','attend church'],
    contact: ['contact','phone','telephone','mobile','number','email','e mail','mail','call','calling','reach','reach you','reach the church','get in touch','contact details','contact information'],
    prayer: ['pray','prayer','prayers','prayer request','prayer requests','pray for me','need prayer','request prayer','someone to pray','prayer support'],
    giving: ['give','giving','giver','offering','tithe','tithing','donate','donation','donations','financial support','support the church','contribute','contribution'],
    ministry: ['ministry','ministries','serve','serving','volunteer','volunteering','team','department','departments','join a ministry','join ministry','get involved','serve at church','serve in church'],
    live: ['live','live stream','livestream','live-stream','online service','watch online','watch live','broadcast','streaming','stream'],
    event: ['event','events','program','programs','calendar','upcoming','what is happening','whats happening','this week','this month','activity','activities'],
    membership: ['membership','member','members','join the church','foundation class','foundation classes','maturity class','maturity classes','class','classes','course','courses','registration'],
    about: ['about','who are you','what is the church','tell me about','belief','beliefs','believe','vision','mission','history'],
    location: ['location','where are you','where is the church','address','directions','branch','branches','find the church','find a branch','where can i find you'],
    pastor: ['pastor','pastors','minister','ministers','bishop','leader','leaders','leadership'],
    youth: ['youth','young people','teen','teens','teenagers','young adults'],
    children: ['children','child','kids','kid','sunday school','kids church'],
    counselling: ['counselling','counseling','counsellor','counselor','guidance','support'],
    baptism: ['baptism','baptize','baptised','baptized'],
    salvation: ['salvation','saved','accept jesus','accept christ','born again','give my life to jesus','give my life to christ']
  };

  function has(text, terms) { return terms.some(term => text === term || text.includes(term)); }
  function score(text, terms) { return terms.reduce((total, term) => total + (text.includes(term) ? (term.includes(' ') ? 3 : 1) : 0), 0); }
  function bestTopic(q) {
    const scores = Object.entries(WORDS).map(([topic, terms]) => [topic, score(q, terms)]).sort((a,b) => b[1] - a[1]);
    return scores[0][1] > 0 ? scores[0][0] : null;
  }

  function formatServices(site) {
    const services = Array.isArray(site.services) ? site.services : [];
    return services.length ? `Here are the current service times:\n\n${services.map(s => `• ${s.title || 'Service'}: ${s.time || 'Please check the website'}`).join('\n')}\n\nWe'd love to worship with you! 🙏` : 'Please check the Service Times section of the website for the latest schedule.';
  }
  function formatContact(site, church) { return `You can contact ${church} through:\n\n📞 ${site.phone || 'the church phone number'}\n✉️ ${site.email || 'the church email address'}\n\nWe'll be happy to help you. 😊`; }

  function answerQuestion(question, site) {
    const q = normalize(question), church = site.churchName || 'our church';
    if (!q) return 'Please type a question and I’ll do my best to help. 😊';

    if (has(q, WORDS.greeting)) return `Hello! 👋 Welcome to ${church}. How can I help you today? You can ask about service times, visiting, prayer, ministries, giving, live worship or contacting the church.`;

    const topic = bestTopic(q);
    const asksTime = has(q, WORDS.time);

    if (topic === 'service' || (asksTime && has(q, ['church','worship','sunday','meet','meeting','service']))) return formatServices(site);
    if (topic === 'newHere') return `Welcome! ❤️ ${site.aboutText ? site.aboutText : `We’re glad you’re considering visiting ${church}.`}\n\nFor a first visit, start with the “I’m New Here” section on the website. If you have questions about where to go or what to expect, contact us and we’ll be happy to help.`;
    if (topic === 'contact') return formatContact(site, church);
    if (topic === 'prayer') return 'We would be honoured to pray with you. 🙏 Please use the prayer/contact option on the website to send your request, or contact the church directly. If your request is urgent or sensitive, please speak directly with a church leader.';
    if (topic === 'giving') return 'Thank you for your heart to give. ❤️ Please use the Giving section on the website for the church’s current giving instructions. If you need help with a giving method, contact the church directly.';
    if (topic === 'ministry') return 'We’d love to help you get connected and serve. 🤝 Please explore the Ministries and “I’m New Here” sections of the website, or contact the church so the right ministry can assist you.';
    if (topic === 'live') { const live = site.liveStream || {}; return live.enabled && live.url ? `${live.title || 'Live Worship Service'} is available here:\n${live.url}\n\n${live.description || 'Join us online for worship, the Word and fellowship. 🙏'}` : 'The live stream is not currently available. Please check the Live page again when a service is scheduled. 🙏'; }
    if (topic === 'event') return 'For current programs and events, please open the Events/Upcoming Programs section of the website. That information can change, so the website is the best place to see the latest schedule. 📅';
    if (topic === 'membership') { const classes = Array.isArray(site.membershipClasses) ? site.membershipClasses : []; return classes.length ? `Our current faith and membership classes include:\n\n${classes.map(c => `• ${c.title || 'Class'}`).join('\n')}\n\nUse the registration/contact option on the website to get started. 🙌` : 'Please check the Faith & Membership Classes section for current classes and registration information.'; }
    if (topic === 'about') return site.aboutText || `${church} is a community committed to worship, fellowship, the Word of God, prayer, service and sharing the Gospel.`;
    if (topic === 'location') return 'For the latest location and branch information, please open the “Find a Branch” section of the website. If you need help finding the church, contact us and someone will assist you.';
    if (topic === 'pastor') return 'For current pastor and leadership information, please check the church’s About/Leadership section or contact the church directly. I don’t want to guess and give you outdated information.';
    if (topic === 'youth') return 'For youth and young-adult activities, please check the Ministries and Events sections for the current programme. You can also contact the church and ask to be connected with the youth ministry. 🙌';
    if (topic === 'children') return 'For children’s ministry and Sunday school information, please check the Ministries and Events sections for the current programme. We’ll be happy to help you get connected. 👧🧒';
    if (topic === 'counselling') return 'If you would like pastoral counselling or guidance, please contact the church so a suitable leader can speak with you privately. 🙏';
    if (topic === 'baptism') return 'For baptism information, please contact the church or check the relevant ministry/classes section. A church leader can explain the preparation and next steps. 🙏';
    if (topic === 'salvation') return 'If you want to know more about following Jesus, we’d be glad to walk with you. ❤️ Please contact the church or join a service so someone can speak with you personally about faith, salvation and your next steps.';

    // Useful mixed-intent cases: visitors often combine several topics in one sentence.
    if (has(q, ['where']) && has(q, ['service','worship'])) return `${formatServices(site)}\n\nFor location/directions, open the “Find a Branch” section or contact us.`;
    if (has(q, ['how do i','how can i','i want to']) && has(q, ['join','serve','volunteer'])) return 'We’d love to have you involved! 🤝 Please explore the Ministries section and contact the church to find the right place to serve.';
    if (has(q, ['today','tonight','this sunday','tomorrow']) && has(q, ['service','worship','church'])) return `${formatServices(site)}\n\nFor the exact upcoming date, please check the current Events/Service Times section.`;

    return `I’m sorry, I don’t have a reliable answer for that yet. 🙏 I can help with service times, visiting the church, prayer, ministries, giving, live worship, membership classes, events, location and contact information.\n\nFor anything else, please contact ${church} directly so a member of the team can help you.`;
  }

  async function ask(question) {
    if (state.loading) return;
    const cleanQuestion = String(question || '').trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!cleanQuestion) return;
    const panel = createPanel(), nameInput = panel.querySelector('.church-chat-name'), name = nameInput.value.trim() || 'Visitor';
    setName(name); state.loading = true; panel.querySelector('.church-chat-send').disabled = true;
    const input = panel.querySelector('.church-chat-input'); addMessage(name, cleanQuestion, 'user'); input.value = ''; setStatus('Thinking…');
    try { const site = await loadSite(); await new Promise(resolve => setTimeout(resolve, 250)); addMessage('Church Assistant', answerQuestion(cleanQuestion, site), 'bot'); setStatus(''); }
    catch (_) { addMessage('Church Assistant', 'I’m having trouble loading the church information right now. Please contact the church directly for assistance. 🙏', 'bot'); setStatus(''); }
    finally { state.loading = false; panel.querySelector('.church-chat-send').disabled = false; input.focus(); }
  }
  function sendMessage(event) { event.preventDefault(); if (state.loading) return; const input = createPanel().querySelector('.church-chat-input'); const question = input.value.trim(); if (question) ask(question); }
  function open() { const panel = createPanel(); panel.style.display = 'flex'; state.open = true; loadSite(); }
  function close() { const panel = document.querySelector('.church-chat-panel'); if (panel) panel.style.display = 'none'; state.open = false; }

  document.addEventListener('click', event => { const bubble = event.target.closest?.('.chat'); if (!bubble) return; event.preventDefault(); event.stopPropagation(); open(); }, true);
})();
