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
    { title: 'Sunday Worship Service', time: 'Sundays | 9:00 AM', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp' },
    { title: 'Healing and Deliverance Service', time: 'Tuesdays | 5:30 PM', image: 'https://cdn.prod.website-files.com/5f6b9a421d5a61e1d0cd9e3d/67993630bb7f463a5b9c6b0a_worship-672c02982a03e589238fc443_62f285c4f9aa3441840257d6_nathan-mullet-pmiW630yDPE-unsplash.jpeg' },
    { title: 'Power Communion Service', time: 'Wednesdays | 5:30 PM', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785' },
    { title: 'Worship, Word & Wonders Night', time: 'Fridays | 5:30 PM', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp' },
    { title: 'Commanding the Day Midnight Prayer', time: 'Last Friday | 11:00 PM', image: 'https://cdn.prod.website-files.com/5f6b9a421d5a61e1d0cd9e3d/67993630bb7f463a5b9c6b0a_worship-672c02982a03e589238fc443_62f285c4f9aa3441840257d6_nathan-mullet-pmiW630yDPE-unsplash.jpeg' }
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
