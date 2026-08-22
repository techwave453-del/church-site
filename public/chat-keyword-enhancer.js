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
      'hello', 'hi', 'hey', 'hiya', 'hey there', 'hello there', 'good morning',
      'good afternoon', 'good evening', 'good day', 'how are you', 'how are things',
      'how is it going', 'how is your day', 'greetings', 'shalom', 'blessings',
      'peace be with you', 'praise the lord'
    ],
    appreciation: [
      'thank you', 'thanks', 'thank u', 'thx', 'ty', 'many thanks', 'thanks a lot',
      'thanks so much', 'thank you so much', 'thank you very much', 'much appreciated',
      'really appreciate it', 'i appreciate it', 'i appreciate your help',
      'appreciate your help', 'that helps', 'very helpful', 'so helpful',
      'great help', 'helpful thank you', 'great thank you', 'awesome thank you',
      'perfect thank you', 'you helped me', 'you have helped me'
    ],
    farewell: [
      'bye', 'goodbye', 'good bye', 'see you', 'see you later', 'talk to you later',
      'catch you later', 'until next time', 'have a good day', 'have a great day',
      'have a blessed day', 'god bless', 'god bless you', 'bless you', 'take care',
      'good night', 'have a good night'
    ],
    acknowledgement: [
      'ok', 'okay', 'alright', 'all right', 'got it', 'understood', 'i understand',
      'that makes sense', 'makes sense', 'noted', 'sure', 'yes', 'yeah', 'yep',
      'great', 'perfect', 'nice', 'sounds good', 'sounds great'
    ],
    confirmation: [
      'yes please', 'yes thank you', 'sure please', 'please do', 'go ahead',
      'thats fine', "that's fine", 'that is fine', 'thats okay', "that's okay",
      'that is okay', 'no problem', 'no worries'
    ],
    apology: [
      'sorry', 'i am sorry', "i'm sorry", 'my apologies', 'apologies',
      'sorry about that', 'pardon me', 'excuse me'
    ],
    excitement: [
      'wow', 'amazing', 'awesome', 'wonderful', 'fantastic', 'excellent',
      'thats amazing', "that's amazing", 'that is amazing', 'love it',
      'great news', 'hallelujah', 'amen', 'amen!', 'praise god', 'praise the lord'
    ],
    encouragement: [
      'keep it up', 'well done', 'good job', 'great job', 'you are doing great',
      'youre doing great', "you're doing great", 'keep going', 'god bless you all',
      'blessings to you', 'blessings to everyone'
    ],
    helpRequest: [
      'can you help me', 'could you help me', 'please help me', 'i need help',
      'help me please', 'can you assist me', 'could you assist me', 'i need assistance',
      'i have a question', 'can i ask a question', 'may i ask a question'
    ],
    positiveFeedback: [
      'this is helpful', 'this is great', 'this is good', 'very good', 'really good',
      'nice work', 'great work', 'excellent work', 'love this', 'i like this',
      'i like it', 'very useful'
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
    // Specific intents first so phrases such as "yes please" don't become generic acknowledgements.
    const order = ['appreciation', 'confirmation', 'farewell', 'greeting', 'helpRequest', 'apology', 'encouragement', 'excitement', 'positiveFeedback', 'acknowledgement'];
    return order.find(intent => matches(text, patterns[intent])) || null;
  }

  async function handleConversationalMessage(event) {
    const form = event.target;
    if (!form?.matches('.church-chat-form')) return;
    const input = form.querySelector('.church-chat-input');
    const nameInput = form.querySelector('.church-chat-name');
    const message = input?.value?.trim();
    const intent = classify(message);
    if (!intent) return;
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
      farewell: `You’re very welcome! 🙏 God bless you, and have a wonderful day. ❤️`,
      acknowledgement: `Absolutely! 😊 If you need anything else, just let me know. 🙏`,
      confirmation: `Great! 👍 Let’s continue. How can I help you? 😊`,
      apology: `No worries at all! 😊 You’re welcome to ask anything about the church. 🙏`,
      excitement: `Amen! 🙌 That’s wonderful to hear. How else can I help you? 😊`,
      encouragement: `Thank you! 🙏❤️ We truly appreciate the encouragement. God bless you!`,
      helpRequest: `Of course! 😊 I’m here to help. You can ask me about services, events, ministries, prayer, giving, visiting, live worship, location or contacting the church. 🙏`,
      positiveFeedback: `Thank you! 😊❤️ I’m glad the information is useful. Let me know if there’s anything else you’d like to know. 🙏`
    };
    appendMessage('Church Assistant', replies[intent], 'bot');
  }

  document.addEventListener('submit', handleConversationalMessage, true);
})();
