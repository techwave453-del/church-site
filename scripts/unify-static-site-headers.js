import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public');
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.html') && !/^admin(?:-|\/)/i.test(name));

for (const name of files) {
  const file = path.join(dir, name);
  let html = fs.readFileSync(file, 'utf8');
  if (!/<body\b/i.test(html)) continue;

  html = html.replace(/\s*<!-- unified-static-header:start -->[\s\S]*?<!-- unified-static-header:end -->\s*/gi, '\n');
  html = html.replace(/<link[^>]+href=["'][^"']*approved-site-header\.css[^>]*>/gi, '');
  html = html.replace(/<link[^>]+href=["'][^"']*navigation-enhancer\.css[^>]*>/gi, '');
  html = html.replace(/<script[^>]+src=["'][^"']*static-site-header\.js[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]+src=["'][^"']*navigation-enhancer\.js[^>]*><\/script>/gi, '');

  const styles = '\n<link rel="stylesheet" href="/approved-site-header.css">\n<link rel="stylesheet" href="/navigation-enhancer.css">';
  html = html.replace(/<\/head>/i, `${styles}\n</head>`);
  const scripts = '\n<!-- unified-static-header:start -->\n<script src="/static-site-header.js"></script>\n<script src="/navigation-enhancer.js?v=3"></script>\n<!-- unified-static-header:end -->';
  html = html.replace(/<\/body>/i, `${scripts}\n</body>`);
  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Unified homepage header assets across ${files.length} public HTML pages.`);