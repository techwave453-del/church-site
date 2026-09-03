(() => {
  const bubble = document.getElementById('chatBubble');
  if (!bubble) return;
  bubble.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 7.8 7.8 0 0 1-3.4-.8L4 20l1.5-4.1A7.5 7.5 0 1 1 20 11.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  bubble.addEventListener('click', () => {
    if (typeof window.openChurchAssistant === 'function') {
      window.openChurchAssistant();
      return;
    }
    const existing = document.querySelector('[data-church-assistant],#churchAssistant,#chatWidget,.chatWidget,.assistantWidget');
    if (existing) {
      existing.classList.remove('hidden','is-hidden','closed');
      existing.setAttribute('aria-hidden','false');
    }
  }, { once: true });
})();
