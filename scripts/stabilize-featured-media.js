import fs from 'node:fs';

const path = 'src/DetailPages.jsx';
let source = fs.readFileSync(path, 'utf8');

// Normalize the API featured flag so boolean, numeric and string values all work.
source = source.replace(
  /featured:x\.type==='video'&&x\.featured===true/,
  "featured:x.type==='video'&&(x.featured===true||x.featured===1||x.featured==='1'||String(x.featured).toLowerCase()==='true')"
);

// The public Featured Message must use only an explicitly featured video from
// /api/media. Never fall back to the media catalog, the first video, or the
// first media item, because those sources may contain the Live Service stream.
const featuredPattern = /const featured\s*=\s*[^;]+;/;
if (featuredPattern.test(source)) {
  source = source.replace(
    featuredPattern,
    "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;"
  );
}

// Also remove an older two-line selector if a previous build-script revision
// left it behind.
source = source.replace(
  /const explicitFeatured\s*=\s*[^;]+;\\nconst featured\s*=\s*explicitFeatured;/,
  "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;"
);
source = source.replace(
  /const explicitFeatured\s*=\s*[^;]+;\nconst featured\s*=\s*explicitFeatured;/,
  "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;"
);

if (!source.includes("const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;")) {
  throw new Error('Featured Media stabilization did not find the public Media selector.');
}

if (source.includes('\\nconst featured=explicitFeatured')) {
  throw new Error('Featured Media stabilization left an invalid literal \\n escape in DetailPages.jsx.');
}

fs.writeFileSync(path, source);
console.log('Stabilized public Featured Message to use only the explicitly featured media item.');
