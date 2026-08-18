export const DEFAULT_SITE_CONTENT = {
  churchName: 'AIC KITANGA',
  tagline: '',
  title: 'Welcome Home',
  subtitle: 'A place of faith, family and transformation.',
  cta: 'Enter Site',
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
  return {
    ...DEFAULT_SITE_CONTENT,
    ...values,
    gallery: Array.isArray(values.gallery) ? values.gallery : DEFAULT_SITE_CONTENT.gallery
  };
}
