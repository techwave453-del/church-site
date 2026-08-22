(() => {
  // Lightweight intent layer for short social/conversational messages.
  // These messages should never fall through to the church-information fallback.
  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const patterns = {
    greeting: [
      'hello', 'hi', 'hey', 'hiya', 'good morning', 'good afternoon',
      'good evening', 'good day', 'how are you', 'how are things',
      'greetings', 'shalom', 'blessings'
    ],
    appreciation: [
      'thank you', 'thanks', 'thank u', 'thx', 'many thanks',
      'thanks a lot', 'thank you so much', 'much appreciated',
      'really appreciate it', 'i appreciate it', 'appreciate your help',
      'that helps', 'helpful thank you', 'great thank you'
    ],
    farewell: [
      'bye', 'goodbye', 'see you', 'see you later', 'talk to you later',
      'have a good day', 'have a blessed day', 'god bless you'
    ]
  };

  const matches = (text, words) => words.some(word => text === word || text.includes(word));

  async function getChurchName() {
    try {
      const response = await fetch('/api/site/content', {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) return 'our church';
      const site = await response.json();
      return site?.churchName || 'our church';
    } catch (_) {
      return 'our church';
    }
  }

  function getPanel() {
    return document.querySelector('.church-chat-panel');
  }

  function appendMessage(name, text, type) {
    const panel = getPanel();
    const box = panel?.querySelector('.church-chat-messages');
    if (!box) return;

    const empty = box.querySelector('.church-chat-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = `church-chat-message ${type === 'user' ? 'mine' : 'bot'}`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${name} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = text;

    item.append(meta, body);
    box.appendChild(item);
    box.scrollTop = box.scrollHeight;
  }

  function classify(message) {
    const text = normalize(message);
    if (matches(text, patterns.appreciation)) return 'appreciation';
    if (matches(text, patterns.farewell)) return 'farewell';
    if (matches(text, patterns.greeting)) return 'greeting';
    return null;
  }

  async function handleConversationalMessage(event) {
    const form = event.target;
    if (!form?.matches('.church-chat-form')) return;

    const input = form.querySelector('.church-chat-input');
    const nameInput = form.querySelector('.church-chat-name');
    const message = input?.value?.trim();
    const intent = classify(message);
    if (!intent) return;

    // Stop the existing church-information responder from treating a greeting or
    // appreciation as an information request.
    event.preventDefault();
    event.stopImmediatePropagation();

    const name = nameInput?.value?.trim() || 'Visitor';
    if (nameInput) localStorage.setItem('church_chat_name', name.slice(0, 60));
    appendMessage(name, message, 'user');
    input.value = '';

    const church = await getChurchName();
    const replies = {
      greeting: `Hello! 👋 Welcome to ${church}. It’s wonderful to hear from you. How can I help you today? 😊`,
      appreciation: `You’re very welcome! 😊❤️ I’m glad I could help. If you have any other questions about ${church}, I’m here for you. 🙏`,
      farewell: `You’re very welcome! 🙏 God bless you, and have a wonderful day. ❤️`
    };
    appendMessage('Church Assistant', replies[intent], 'bot');
  }

  // The chat widget is loaded before this deferred script, so capture phase lets
  // this intent layer handle conversational messages before the generic submit handler.
  document.addEventListener('submit', handleConversationalMessage, true);
})();
