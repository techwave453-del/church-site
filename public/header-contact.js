(() => {
  const loadContact = async () => {
    const page = document.querySelector('.page.entered');
    const header = page?.querySelector(':scope > header');
    if (!page || !header) return;

    let bar = page.querySelector(':scope > .headerContactBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'headerContactBar';
      bar.setAttribute('aria-label', 'Church contact information');
      header.insertAdjacentElement('afterend', bar);
    }

    try {
      const response = await fetch('/api/site/content', {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      if (!response.ok) return;
      const content = await response.json();
      const phone = String(content?.phone || '').trim();
      const email = String(content?.email || '').trim();
      const services = Array.isArray(content?.services) ? content.services : [];
      const firstService = services.find(item => String(item?.time || '').trim());
      const serviceTime = String(firstService?.time || '').trim();

      bar.replaceChildren();
      const addItem = (icon, label, href) => {
        if (!label) return;
        const item = document.createElement(href ? 'a' : 'span');
        item.className = 'headerContactItem';
        if (href) item.href = href;
        const iconEl = document.createElement('span');
        iconEl.className = 'headerContactIcon';
        iconEl.setAttribute('aria-hidden', 'true');
        iconEl.textContent = icon;
        const text = document.createElement('span');
        text.className = 'headerContactText';
        text.textContent = label;
        item.append(iconEl, text);
        bar.appendChild(item);
      };

      addItem('☎', phone, phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '');
      addItem('✉', email, email ? `mailto:${email}` : '');
      if (serviceTime) addItem('◷', `Sunday service · ${serviceTime}`, '');

      if (!bar.children.length) bar.hidden = true;
      else bar.hidden = false;
    } catch (_) {
      // Keep the public header usable if the public site-content endpoint is unavailable.
    }
  };

  const start = () => {
    loadContact();
    const observer = new MutationObserver(loadContact);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
