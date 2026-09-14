import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const publicDir = path.join(root, 'public');
fs.mkdirSync(publicDir, { recursive: true });

let commit = process.env.RENDER_GIT_COMMIT || process.env.COMMIT_SHA || '';
if (!commit) {
  try { commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(); } catch (_) {}
}
const version = commit || `${Date.now()}`;
const payload = { version, builtAt: new Date().toISOString() };
fs.writeFileSync(path.join(publicDir, 'build-version.json'), `${JSON.stringify(payload)}\n`, 'utf8');
console.log(`Build version: ${version}`);
