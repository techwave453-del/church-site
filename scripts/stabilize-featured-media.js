import fs from 'node:fs';

const path = 'src/DetailPages.jsx';
let source = fs.readFileSync(path, 'utf8');

// Normalize the API featured flag so boolean, numeric and string values all work.
source = source.replace(
  "featured:x.type==='video'&&x.featured===true",
  "featured:x.type==='video'&&(x.featured===true||x.featured===1||x.featured==='1'||String(x.featured).toLowerCase()==='true')"
);

// The Featured Message must come only from the media record explicitly marked
// featured in /api/media. Never fall back to mediaCatalog or the first video,
// because those sources can contain the Live Service video.
const selectors = [
  "const featured=legacy.find(x=>x.featured&&x.videoUrl)||catalog.find(x=>x.featured&&x.videoUrl)||all.find(x=>x.videoUrl)||all[0];",
  "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;",
  "const explicitFeatured=legacy.find(x=>x.featured&&x.videoUrl)||catalog.find(x=>x.featured&&x.videoUrl)||null;\\nconst featured=explicitFeatured;",
  "const explicitFeatured=legacy.find(x=>x.featured&&x.videoUrl)||catalog.find(x=>x.featured&&x.videoUrl)||null;\nconst featured=explicitFeatured;"
];

for (const selector of selectors) {
  if (source.includes(selector)) {
    source = source.replace(selector, "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;");
    break;
  }
}

// Guard against the exact failure that previously reached Vite: a literal
// backslash-n inserted into JavaScript source.
source = source.replace(
  "const explicitFeatured=legacy.find(x=>x.featured&&x.videoUrl)||null;\\nconst featured=explicitFeatured;",
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
