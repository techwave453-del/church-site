(() => {
  const state = { open: false, loading: false, messages: [], lastSignature: '' };
  const NAME_KEY = 'church_chat_name';

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-panel{position:fixed;right:22px;bottom:92px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 120px));z-index:99999;background:#fff;border-radius:20px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(0,0,0,.08);font-family:inherit}
    .church-chat-header{padding:16px 18px;background:linear-gradient(135deg,#173f35,#286451);color:#fff;display:flex;align-items:center;justify-content:space-between}
    .church-chat-title{display:flex;align-items:center;gap:10px}.church-chat-title-icon{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:19px}.church-chat-title strong{display:block;font-size:15px}.church-chat-title small{display:block;opacity:.8;font-size:11px;margin-top:2px}
    .church-chat-close{border:0;background:transparent;color:#fff;font-size:25px;line-height:1;cursor:pointer;padding:5px}
    .church-chat-messages{flex:1;overflow:auto;padding:16px;background:#f6f8f7;display:flex;flex-direction:column;gap:9px}
    .church-chat-message{max-width:82%;padding:10px 12px;border-radius:16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07);align-self:flex-start}.church-chat-message.mine{align-self:flex-end;background:#dff2e9}.church-chat-message .meta{font-size:10px;opacity:.58;margin-bottom:4px}.church-chat-message .body{font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
    .church-chat-empty{text-align:center;margin:auto;color:#66736e;font-size:13px;line-height:1.5;padding:20px}.church-chat-status{padding:7px 14px;font-size:11px;color:#8a3f2e;background:#fff3ef;border-top:1px solid #f0ddd6}
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
    panel.setAttribute('aria-label', 'Church chat');
    panel.innerHTML = `
      <div class="church-chat-header">
        <div class="church-chat-title"><span class="church-chat-title-icon">💬</span><div><strong>Church Chat</strong><small>Connect with our church community</small></div></div>
        <button class="church-chat-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="church-chat-messages"><div class="church-chat-empty">Welcome! 👋<br>Send us a message and join the conversation.</div></div>
      <div class="church-chat-status" hidden></div>
      <form class="church-chat-form">
        <input class="church-chat-name" maxlength="60" placeholder="Your name" autocomplete="name" required />
        <div class="church-chat-row"><textarea class="church-chat-input" maxlength="500" placeholder="Type your message…" rows="1" required></textarea><button class="church-chat-send" type="submit" aria-label="Send message">➤</button></div>
        <div class="church-chat-note">Please keep messages respectful and encouraging. 🙏</div>
      </form>`;
    document.body.appendChild(panel);
    panel.querySelector('.church-chat-name').value = getName();
    panel.querySelector('.church-chat-close').addEventListener('click', close);
    panel.querySelector('.church-chat-form').addEventListener('submit', sendMessage);
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

  function renderMessages() {
    const panel = createPanel();
    const box = panel.querySelector('.church-chat-messages');
    const name = getName().toLowerCase();
    if (!state.messages.length) {
      box.innerHTML = '<div class="church-chat-empty">No messages yet.<br>Be the first to say hello! 👋</div>';
      return;
    }
    box.innerHTML = '';
    state.messages.slice().reverse().forEach(message => {
      const item = document.createElement('div');
      item.className = 'church-chat-message' + (escText(message.name).toLowerCase() === name ? ' mine' : '');
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${escText(message.name)} · ${formatTime(message.created_at)}`;
      const body = document.createElement('div'); body.className = 'body'; body.textContent = escText(message.comment);
      item.append(meta, body); box.appendChild(item);
    });
    box.scrollTop = box.scrollHeight;
  }

  function formatTime(value) {
    try { return new Date(value).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch (_) { return ''; }
  }

  async function loadMessages(silent = false) {
    try {
      const response = await fetch('/api/live/comments', {headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Chat service unavailable.');
      const data = await response.json();
      const messages = Array.isArray(data) ? data : [];
      const signature = JSON.stringify(messages.map(x => [x.id,x.created_at,x.comment,x.name]));
      state.messages = messages;
      if (signature !== state.lastSignature || !silent) { state.lastSignature = signature; renderMessages(); }
      if (!silent) setStatus('');
    } catch (error) {
      if (!silent) setStatus(error.message || 'Unable to load chat right now.');
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (state.loading) return;
    const panel = createPanel();
    const nameInput = panel.querySelector('.church-chat-name');
    const input = panel.querySelector('.church-chat-input');
    const name = nameInput.value.trim();
    const comment = input.value.trim();
    if (!name || !comment) return;
    setName(name);
    state.loading = true;
    panel.querySelector('.church-chat-send').disabled = true;
    setStatus('Sending…');
    try {
      const response = await fetch('/api/live/comments', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name,comment})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to send your message.');
      input.value = '';
      setStatus('Message sent ✓');
      await loadMessages(true);
      setTimeout(() => setStatus(''), 1800);
    } catch (error) {
      setStatus(error.message || 'Unable to send your message.');
    } finally {
      state.loading = false;
      panel.querySelector('.church-chat-send').disabled = false;
      input.focus();
    }
  }

  function open() {
    const panel = createPanel();
    panel.style.display = 'flex';
    state.open = true;
    loadMessages();
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

  setInterval(() => { if (state.open) loadMessages(true); }, 5000);
})();
