export const DEFAULT_SITE_CONTENT = {
  churchName: 'AIC Kitanga',
  tagline: '',
  title: 'Welcome Home',
  subtitle: 'A place of faith, family and transformation.',
  cta: 'Enter Site',
  aboutEyebrow: 'Who We Are',
  aboutTitle: 'About Us',
  aboutText: "Dunamis International Gospel Centre is a dynamic Pentecostal Christian Church founded by the man of God, Dr. Pastor Paul Enenche. It is a big family of power, glory and the unfathomable flow of God's grace.",
  servicesEyebrow: 'Join Us In Worship',
  servicesTitle: 'Service Times',
  links: [
    { title: "I'm New Here", text: 'Discover church membership', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', url: '#' },
    { title: 'Find a Branch', text: 'Connect with a church near you', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', url: '#' },
    { title: 'Upcoming Programs', text: 'See what is happening next', image: 'https://cdn.prod.website-files.com/5f6b9a421d5a61e1d0cd9e3d/67993630bb7f463a5b9c6b0a_worship-672c02982a03e589238fc443_62f285c4f9aa3441840257d6_nathan-mullet-pmiW630yDPE-unsplash.jpeg', url: '#' },
    { title: 'Testimonies', text: 'Celebrate what God has done', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', url: '#' },
    { title: 'Download Center', text: 'Messages, resources and more', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', url: '#' }
  ],
  membershipEyebrow: 'Join Our Family',
  membershipTitle: 'Church Membership',
  membershipClasses: [
    { title: 'Foundation Class', image: 'https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_9_large.jpg?v=1717170785', registrationUrl: '#' },
    { title: 'Maturity Class', image: 'https://cfni.org/wp-content/uploads/2024/12/Banner_Mackbook16_Worship.webp', registrationUrl: '#' }
  ],
  footerTagline: 'A place of faith, family and transformation.',
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
