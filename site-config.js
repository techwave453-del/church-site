export const DEFAULT_SITE_CONTENT = {
  churchName: 'Kingdom Fellowship Christian Church',
  tagline: 'Revealing Christ to Nations',
  title: 'Welcome Home',
  subtitle: 'A place of faith, fellowship, worship and transformation.',
  cta: 'Enter Site',
  aboutEyebrow: 'Who We Are',
  aboutTitle: 'About Kingdom Fellowship Christian Church',
  aboutText: 'Kingdom Fellowship Christian Church is a community committed to revealing Christ to nations through worship, fellowship, the Word of God, prayer, service and the transforming power of the Gospel. Everyone is welcome to find a place to belong and grow in faith.',
  servicesEyebrow: 'Join Us In Worship',
  servicesTitle: 'Service Times',
  links: [
    { title: "I'm New Here", text: 'Find out how to visit and get connected', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', url: '#visit' },
    { title: 'Find a Branch', text: 'Connect with the church community', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', url: '#visit' },
    { title: 'Upcoming Programs', text: 'See our regular services and activities', image: 'https://cdn.prod.website-files.com/5f6b9a421d5a61e1d0cd9e3d/67993630bb7f463a5b9c6b0a_worship-672c02982a03e589238fc443_62f285c4f9aa3441840257d6_nathan-mullet-pmiW630yDPE-unsplash.jpeg', url: '#events' },
    { title: 'Testimonies', text: 'Celebrate what God is doing in our community', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', url: '#media' },
    { title: 'Resources', text: 'Messages, media and helpful resources', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', url: '#resources' }
  ],
  membershipEyebrow: 'Grow With Us',
  membershipTitle: 'Faith & Membership Classes',
  membershipClasses: [
    { title: 'Foundation Class', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', registrationUrl: '#contact' },
    { title: 'Maturity Class', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', registrationUrl: '#contact' }
  ],
  footerTagline: 'Revealing Christ to Nations',
  phone: '+254 700 000 000',
  email: 'hello@aickitanga.org',
  services: [
    { title: 'Sunday Worship Service', time: 'Sundays | 9:00 AM', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Healing and Deliverance Service', time: 'Tuesdays | 5:30 PM', image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Power Communion Service', time: 'Wednesdays | 5:30 PM', image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Worship, Word & Wonders Night', time: 'Fridays | 5:30 PM', image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=85' },
    { title: 'Commanding the Day Midnight Prayer', time: 'Last Friday | 11:00 PM', image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1600&q=85' }
  ],
  videoUrl: 'https://www.pexels.com/download/video/12921271/',
  audioUrl: 'https://youtu.be/9sE5kEnitqE?list=RD7eAvIYagrrs',
  fallbackImage: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785',
  liveStream: { enabled: false, url: '', title: 'Live Worship Service', description: 'Join us live for worship, the Word of God and fellowship.' },
  gallery: [
    { type: 'image', src: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp' },
    { type: 'image', src: 'https://cdn.prod.website-files.com/5f6b9a421d5a61e1d0cd9e3d/67993630bb7f463a5b9c6b0a_worship-672c02982a03e589238fc443_62f285c4f9aa3441840257d6_nathan-mullet-pmiW630yDPE-unsplash.jpeg' },
    { type: 'image', src: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785' },
    { type: 'video', src: '/hero-video.mp4' }
  ]
};

export function mergeSiteContent(values = {}) {
  const merged = {
    ...DEFAULT_SITE_CONTENT,
    ...values,
    gallery: Array.isArray(values.gallery) ? values.gallery : DEFAULT_SITE_CONTENT.gallery
  };

  ['services', 'links', 'membershipClasses'].forEach((key) => {
    if (!Array.isArray(values[key])) merged[key] = DEFAULT_SITE_CONTENT[key];
  });

  return merged;
}

// Add the live action as a floating control, matching the existing chat control.
// It reads the live configuration from the same API used by the public site.
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
  const mountLiveButton = async () => {
    try {
      const response = await fetch('/api/site/content');
      if (!response.ok) return;
      const content = await response.json();
      const live = content?.liveStream;
      if (!live?.enabled || !live?.url) return;
      if (document.getElementById('live-floating-button')) return;

      const style = document.createElement('style');
      style.id = 'live-floating-button-style';
      style.textContent = `
        #live-floating-button{position:fixed;z-index:111;right:25px;bottom:94px;width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ff3030,#d90000);color:#fff;text-decoration:none;box-shadow:0 15px 40px rgba(255,48,48,.42);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
        #live-floating-button:hover{transform:translateY(-3px);box-shadow:0 19px 44px rgba(255,48,48,.52)}
        #live-floating-button .live-icon{position:relative;width:24px;height:24px;border:2px solid currentColor;border-radius:50%;display:grid;place-items:center}
        #live-floating-button .live-icon:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 0 4px rgba(255,255,255,.16)}
        #live-floating-button .live-dot{position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.2);animation:livePulse 1.5s infinite}
        @keyframes livePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.25);opacity:.7}}
        @media(max-width:700px){#live-floating-button{right:14px;bottom:76px;width:52px;height:52px}}
      `;
      document.head.appendChild(style);

      const button = document.createElement('a');
      button.id = 'live-floating-button';
      button.href = live.url;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.setAttribute('aria-label', 'Watch live worship service');
      button.title = live.title || 'Watch live';
      button.innerHTML = '<span class="live-icon" aria-hidden="true"></span><span class="live-dot" aria-hidden="true"></span>';
      document.body.appendChild(button);
    } catch (_) {
      // Keep the public site working if the live configuration cannot be loaded.
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountLiveButton, { once: true });
  else mountLiveButton();
}
