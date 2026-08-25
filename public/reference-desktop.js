(() => {
  const desktop = window.matchMedia('(min-width: 701px)');
  if (!desktop.matches) return;

  const navGroups = [
    { label: 'About', items: [{ label: 'About the Church', target: 'about' }, { label: 'Visit Us', target: 'visit' }] },
    { label: 'Events', items: [{ label: 'Service Times', target: 'events' }] },
    { label: 'Visit Us', items: [{ label: "I'm New Here", target: 'visit' }, { label: 'Find a Branch', target: 'visit' }] },
    { label: 'Media', items: [{ label: 'Media & Church Resources', target: 'media' }] },
    { label: 'Resources', items: [{ label: 'Resources', target: 'resources' }, { label: 'Membership Classes', target: 'resources' }] }
  ];

  let siteContent = {};
  let heroIndex = 0;
  let heroSlides = [];

  const scrollTo = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const closeMenus = () => {
    document.querySelectorAll('.site-nav-group.open').forEach((group) => {
      group.classList.remove('open');
      group.querySelector('.site-nav-group-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  function buildDesktopNavigation(nav) {
    if (!nav || nav.dataset.referenceNavigation === 'true') return;
    nav.dataset.referenceNavigation = 'true';
    nav.innerHTML = '';

    const home = document.createElement('a');
    home.href = '#home';
    home.textContent = 'Home';
    home.addEventListener('click', (event) => { event.preventDefault(); closeMenus(); scrollTo('home'); });
    nav.appendChild(home);

    navGroups.forEach((group) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'site-nav-group';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'site-nav-group-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.textContent = group.label;
      const submenu = document.createElement('div');
      submenu.className = 'site-nav-submenu';

      group.items.forEach((item) => {
        const link = document.createElement('a');
        link.href = `#${item.target}`;
        link.textContent = item.label;
        link.addEventListener('click', (event) => {
          event.preventDefault();
          closeMenus();
          scrollTo(item.target);
        });
        submenu.appendChild(link);
      });

      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const wasOpen = wrapper.classList.contains('open');
        closeMenus();
        if (!wasOpen) {
          wrapper.classList.add('open');
          button.setAttribute('aria-expanded', 'true');
        }
      });

      wrapper.append(button, submenu);
      nav.appendChild(wrapper);
    });

    const give = document.createElement('a');
    give.href = '#give';
    give.textContent = 'Give';
    give.addEventListener('click', (event) => { event.preventDefault(); closeMenus(); scrollTo('give'); });
    nav.appendChild(give);

    const contact = document.createElement('a');
    contact.href = '#contact';
    contact.textContent = 'Contact';
    contact.addEventListener('click', (event) => { event.preventDefault(); closeMenus(); scrollTo('contact'); });
    nav.appendChild(contact);
  }

  function addHeaderExtras(header) {
    if (!header || header.dataset.referenceHeader === 'true') return;
    header.dataset.referenceHeader = 'true';

    const meta = document.createElement('div');
    meta.className = 'desktop-reference-meta';
    const email = siteContent.email || 'hello@aickitanga.org';
    const phone = siteContent.phone || '';
    const location = siteContent.location || siteContent.address || siteContent.tagline || 'Worship • Fellowship • Community';
    meta.innerHTML = `<span>✉ ${email}</span><span>⌖ ${location}</span>${phone ? `<span>☎ ${phone}</span>` : ''}`;
    header.appendChild(meta);

    const live = document.createElement('a');
    live.className = 'desktop-reference-live';
    live.href = '/live.html';
    live.textContent = siteContent.liveStream?.enabled ? 'LIVE SERVICE' : 'LIVE SERVICE';
    live.setAttribute('aria-label', 'Open live service');
    header.appendChild(live);
  }

  function makeHeroExtras(hero) {
    if (!hero || hero.dataset.referenceHero === 'true') return;
    hero.dataset.referenceHero = 'true';

    const welcome = document.createElement('div');
    welcome.className = 'desktop-hero-welcome';
    welcome.innerHTML = `<span class="welcome-script">Welcome</span><strong class="welcome-home">HOME</strong>`;
    hero.appendChild(welcome);

    const left = document.createElement('button');
    left.className = 'desktop-hero-arrow left';
    left.type = 'button';
    left.setAttribute('aria-label', 'Previous slide');
    left.textContent = '‹';
    const right = document.createElement('button');
    right.className = 'desktop-hero-arrow right';
    right.type = 'button';
    right.setAttribute('aria-label', 'Next slide');
    right.textContent = '›';
    hero.append(left, right);

    const rail = document.createElement('div');
    rail.className = 'desktop-promo-rail';
    hero.appendChild(rail);

    const renderRail = () => {
      rail.innerHTML = '';
      heroSlides.slice(0, 4).forEach((slide, index) => {
        if (!slide?.src) return;
        const link = document.createElement('a');
        link.href = '#events';
        link.setAttribute('aria-label', `Featured item ${index + 1}`);
        const img = document.createElement('img');
        img.src = slide.src;
        img.alt = '';
        img.loading = 'lazy';
        link.appendChild(img);
        link.addEventListener('click', (event) => { event.preventDefault(); scrollTo('events'); });
        rail.appendChild(link);
      });
    };

    const showSlide = (index) => {
      const slides = hero.querySelectorAll('.carousel-slide');
      if (!slides.length) return;
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === heroIndex));
    };
    left.addEventListener('click', () => showSlide(heroIndex - 1));
    right.addEventListener('click', () => showSlide(heroIndex + 1));
    renderRail();
    showSlide(heroIndex);
  }

  function enhance() {
    const header = document.querySelector('.page > header');
    const hero = document.querySelector('.page .hero.carousel');

    if (!document.querySelector('.page.entered')) {
      const enter = document.querySelector('.page .enter');
      if (enter) enter.click();
      return;
    }

    if (header) {
      buildDesktopNavigation(header.querySelector('.navLinks'));
      addHeaderExtras(header);
    }
    if (hero) {
      heroSlides = Array.from(hero.querySelectorAll('.carousel-slide')).map((slide) => {
        const image = slide.querySelector('img.carousel-media');
        const video = slide.querySelector('video.carousel-media');
        return { src: image?.currentSrc || image?.src || video?.currentSrc || video?.src || '' };
      }).filter((slide) => slide.src);
      makeHeroExtras(hero);
    }
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav-group')) closeMenus();
  });

  fetch('/api/site/content').then((response) => response.ok ? response.json() : {}).then((content) => {
    siteContent = content || {};
    enhance();
  }).catch(() => enhance());

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
