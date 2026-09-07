(() => {
  const cleanup = () => {
    document.querySelectorAll('.detailPage .navLinks, .detailPage .detail-mobile-drawer, #detail-navigation-style').forEach((node) => node.remove());

    document.querySelectorAll('.detailPage').forEach((page) => {
      page.querySelectorAll('.detailHeader').forEach((header) => {
        header.querySelectorAll('.navLinks, .detail-mobile-drawer').forEach((node) => node.remove());
      });
    });
  };

  cleanup();
  const observer = new MutationObserver(cleanup);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
