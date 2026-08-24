import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const files = [
  'admin/admin-header.js','admin/admin-loader.js','admin/admin-session.js',
  'admin/admin-tabs.js','admin/admin-navigation.js','admin/admin-theme.js',
  'admin/admin-media.js','admin/admin-comments.js','admin/admin-site-content.js',
  'admin/admin-services.js','admin/admin-homepage-links.js','admin/admin-classes.js',
  'admin/admin-gallery.js','admin/admin-live.js','admin/admin-bridge.js'
];

for (const file of files) {
  const path = new URL(file, new URL('..', import.meta.url));
  const source = fs.readFileSync(path, 'utf8');
  if (!source.trim()) throw new Error(`Empty admin module: ${file}`);
  if (/<<<<<<<|=======|>>>>>>>/.test(source)) throw new Error(`Merge conflict markers in ${file}`);
}

const admin = fs.readFileSync(new URL('../admin.html', import.meta.url), 'utf8');
if (!admin.includes('admin/admin-header.js')) throw new Error('admin.html does not load admin-header.js');
if ((admin.match(/<script\b/gi) || []).length > 3) throw new Error('Unexpected inline/duplicate script blocks remain in admin.html');

console.log(`Refactor static check passed: ${files.length} admin modules inspected.`);
