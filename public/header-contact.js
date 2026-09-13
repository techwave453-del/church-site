(() => {
  const installHeaderConsistency = () => {
    if (document.getElementById('header-consistency-style')) return;
    const style = document.createElement('style');
    style.id = 'header-consistency-style';
    style.textContent = `
      /* Secondary/detail pages: match homepage header geometry exactly. */
      .detailPage > .detailHeader, header.detailHeader {
        position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100vw !important;
        z-index: 200 !important; display: grid !important; grid-template-columns: minmax(0,1fr) !important;
        grid-template-rows: 112px 54px !important; height: 166px !important; min-height: 166px !important;
        padding: 0 !important; align-items: stretch !important; justify-items: stretch !important;
        background: linear-gradient(100deg,var(--church-navy,#061a2b) 0%,#0b2437 25%,var(--accent-3,#9b6030) 62%,var(--accent-2,#4da6ff) 100%) !important;
        border: 0 !important; box-shadow: 0 8px 28px rgba(0,0,0,.18) !important;
      }
      .detailPage > .detailHeader .detailBrand, header.detailHeader .detailBrand {
        grid-row: 1 !important; position: static !important; transform: none !important; display: flex !important;
        align-items: center !important; justify-content: flex-start !important; width: 100% !important; height: 112px !important;
        min-width: 0 !important; max-width: none !important; padding: 0 28px 0 0 !important; gap: 14px !important;
        text-align: left !important; overflow: hidden !important; background: transparent !important;
      }
      .detailPage > .detailHeader .detailBrandLogo, header.detailHeader .detailBrandLogo {
        display: block !important; width: auto !important; height: 112px !important; max-width: 112px !important;
        max-height: 112px !important; flex: 0 0 auto !important; object-fit: contain !important; object-position: left center !important;
      }
      .detailPage > .detailHeader .detailBrand strong, header.detailHeader .detailBrand strong {
        display: block !important; color: #fff !important; font-family: Fraunces,Georgia,serif !important;
        font-size: clamp(17px,1.45vw,25px) !important; line-height: 1.08 !important; letter-spacing: .095em !important; white-space: nowrap !important;
      }
      .detailPage > .detailHeader .detailBrand span, header.detailHeader .detailBrand span {
        display: block !important; margin-top: 8px !important; color: var(--accent-1,#e6c18f) !important;
        font-family: "Plus Jakarta Sans",system-ui,sans-serif !important; font-size: 9px !important; line-height: 1 !important; letter-spacing: .34em !important; white-space: nowrap !important;
      }
      .detailPage > .detailHeader .navLinks, header.detailHeader .navLinks {
        grid-row: 2 !important; grid-column: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important;
        width: 100% !important; height: 54px !important; padding: 0 28px !important; gap: clamp(8px,1.15vw,20px) !important;
        margin: 0 !important; background: rgba(0,0,0,.12) !important; border: 0 !important;
      }
      .detailPage > .detailHeader .detailBack, .detailPage > .detailHeader .detailMenu, header.detailHeader .detailBack, header.detailHeader .detailMenu { display: none !important; }
      @media (max-width: 700px) {
        .detailPage > .detailHeader, header.detailHeader { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100vw !important; height: 76px !important; min-height: 76px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 10px !important; }
        .detailPage > .detailHeader .detailBrand, header.detailHeader .detailBrand { grid-row: auto !important; height: 76px !important; min-width: 0 !important; width: auto !important; max-width: calc(100% - 58px) !important; flex: 1 1 auto !important; padding: 6px 4px !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: 8px !important; text-align: left !important; overflow: hidden !important; }
        .detailPage > .detailHeader .detailBrandLogo, header.detailHeader .detailBrandLogo { width: 50px !important; height: 62px !important; max-width: 50px !important; max-height: 62px !important; flex: 0 0 50px !important; object-fit: contain !important; }
        .detailPage > .detailHeader .detailBrand strong, header.detailHeader .detailBrand strong { font-size: clamp(10px,3.1vw,14px) !important; line-height: 1.12 !important; letter-spacing: .055em !important; white-space: normal !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; }
        .detailPage > .detailHeader .detailBrand span, header.detailHeader .detailBrand span { font-size: 6.5px !important; letter-spacing: .16em !important; margin-top: 4px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
        .detailPage > .detailHeader .navLinks, header.detailHeader .navLinks { display: none !important; }
        .detailPage > .detailHeader .detailMenu, header.detailHeader .detailMenu { display: grid !important; position: static !important; flex: 0 0 44px !important; width: 44px !important; height: 44px !important; margin-left: 6px !important; place-items: center !important; border: 1px solid rgba(255,255,255,.34) !important; border-radius: 50% !important; background: var(--accent-2,#4da6ff) !important; color: #fff !important; }
        .detailPage > .detailHeader .detailMenu svg, header.detailHeader .detailMenu svg { stroke: #fff !important; }
      }
      @media (max-width: 380px) {
        .detailPage > .detailHeader .detailBrandLogo, header.detailHeader .detailBrandLogo { width: 43px !important; height: 58px !important; flex-basis: 43px !important; }
        .detailPage > .detailHeader .detailBrand, header.detailHeader .detailBrand { gap: 7px !important; padding-left: 2px !important; }
        .detailPage > .detailHeader .detailBrand strong, header.detailHeader .detailBrand strong { font-size: 9.5px !important; letter-spacing: .04em !important; }
        .detailPage > .detailHeader .detailBrand span, header.detailHeader .detailBrand span { font-size: 6px !important; letter-spacing: .12em !important; }
      }
    `;
    document.head.appendChild(style);
  };

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
    installHeaderConsistency();
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
