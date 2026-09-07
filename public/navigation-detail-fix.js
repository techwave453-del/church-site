(() => {
  const routes = {
    'about the church': 'about',
    'visit us': 'visit-us',
    ministries: 'ministries',
    'service times': 'events',
    'membership classes': 'resources',
    sermons: 'sermons',
    'church events': 'events',
    media: 'media',
    'media & church resources': 'media',
    give: 'give',
    contact: 'contact'
  };

  const navigate = (route) => {
    if (!route) return;
    const path = window.location.pathname;
    if (/terms\.html$/i.test(path)) {
      window.location.href = `/?entered=1#detail/${route}`;
      return;
    }
    window.location.hash = `detail/${route}`;
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const nav = link.closest('.site-nav-submenu, .site-nav-group, .site-mobile-submenu, .drawer, .detailPage');
    if (!nav) return;
    const label = link.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
    const route = routes[label];
    if (!route) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(route);
  }, true);
})();
