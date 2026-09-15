import fs from 'node:fs';

const path = 'src/DetailPages.jsx';
let source = fs.readFileSync(path, 'utf8');

// The Featured Message must come only from the media record explicitly marked
// featured in /api/media. Never fall back to mediaCatalog, because that catalog
// can contain the Live Service video and is a different concern.
source = source.replace(
  /const legacy=items\.map\(x=>\(\{id:`legacy-\$\{x\.id\}`,[\s\S]*?\}\)\);\nconst all=/,
  (match) => {
    const normalized = match.replace(
      /featured:x\.type==='video'&&x\.featured===true/,
      "featured:x.type==='video'&&(x.featured===true||x.featured===1||x.featured==='1'||String(x.featured).toLowerCase()==='true')"
    );
    return normalized;
  }
);

source = source.replace(
  /const featured=legacy\.find\(x=>x\.featured&&x\.videoUrl\)\|\|catalog\.find\(x=>x\.featured&&x\.videoUrl\)\|\|all\.find\(x=>x\.videoUrl\)\|\|all\[0\];/,
  "const featured=legacy.find(x=>x.featured&&x.videoUrl)||null;"
);

// Also handle the version introduced by the previous stabilization attempt.
source = source.replace(
  /const explicitFeatured=legacy\.find\(x=>x\.featured&&x\.videoUrl\)\|\|catalog\.find\(x=>x\.featured&&x\.videoUrl\)\|\|null;[\s\S]*?const featured=featuredMediaOverride\|\|explicitFeatured\|\|all\.find\(x=>x\.videoUrl\)\|\|all\[0\];/,
  "const explicitFeatured=legacy.find(x=>x.featured&&x.videoUrl)||null;\\nconst featured=explicitFeatured;"
);

if (!/const featured=legacy\.find\(x=>x\.featured&&x\.videoUrl\)\|\|null;/.test(source) && !/const featured=explicitFeatured;/.test(source)) {
  throw new Error('Featured Media stabilization did not find the public Media selector.');
}

fs.writeFileSync(path, source);
console.log('Stabilized public Featured Message to use only the explicitly featured media item.');
