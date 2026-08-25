(() => {
  const TERMS_HREF = '/terms.html';
  const TERMS_TEXT = 'Terms & Conditions';
  function addLinks() {
    document.querySelectorAll('.siteFooter,.detailFooter').forEach(footer => {
      if (footer.querySelector('[data-terms-link]')) return;
      const link = document.createElement('a');
      link.href = TERMS_HREF;
      link.textContent = TERMS_TEXT;
      link.dataset.termsLink = 'true';
      link.style.marginInlineStart = '14px';
      footer.appendChild(link);
    });
  }
  addLinks();
  new MutationObserver(addLinks).observe(document.body, { childList: true, subtree: true });
})();
