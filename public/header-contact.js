(() => {
  const loadContact = async () => {
    const brand = document.querySelector('.page.entered > header .brand');
    if (!brand || brand.querySelector('.brandContact')) return;

    try {
      const response = await fetch('/api/site/content', { credentials: 'same-origin', cache: 'no-store' });
      const content = response.ok ? await response.json() : null;
      const email = String(content?.email || '').trim();
      if (!email) return;

      const contact = document.createElement('a');
      contact.className = 'brandContact';
      contact.href = `mailto:${email}`;
      contact.textContent = email;
      contact.setAttribute('aria-label', `Email ${email}`);
      contact.addEventListener('click', event => event.stopPropagation());
      brand.appendChild(contact);
    } catch (_) {
      // Keep the header usable if the public site-content endpoint is unavailable.
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContact, { once: true });
  } else {
    loadContact();
  }

  const observer = new MutationObserver(loadContact);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
