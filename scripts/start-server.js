import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'server.js');
const runtimePath = path.join(root, '.server-runtime.mjs');

let source = fs.readFileSync(sourcePath, 'utf8');
const importNeedle = "import session from 'express-session';";
const sessionMiddleware = "app.use(session({secret:process.env.SESSION_SECRET||'development-only-session-secret',resave:false,saveUninitialized:false,name:isProduction?'__Host-kfc.sid':'kfc.sid',cookie:{maxAge:1000*60*60*12,httpOnly:true,sameSite:'strict',secure:isProduction,path:'/'}}));";

if (!source.includes(importNeedle) || !source.includes(sessionMiddleware)) {
  throw new Error('Unable to install the persistent admin session store: server.js layout changed.');
}

source = source.replace(
  importNeedle,
  `${importNeedle}\nimport { SupabaseSessionStore } from './supabase-session-store.js';`
);
source = source.replace(
  sessionMiddleware,
  "app.use(session({secret:process.env.SESSION_SECRET||'development-only-session-secret',resave:false,saveUninitialized:false,name:isProduction?'__Host-kfc.sid':'kfc.sid',store:supabase?new SupabaseSessionStore({supabase,ttlMs:1000*60*60*12}):undefined,cookie:{maxAge:1000*60*60*12,httpOnly:true,sameSite:'strict',secure:isProduction,path:'/'}}));"
);

fs.writeFileSync(runtimePath, source, 'utf8');
process.on('exit', () => {
  try { fs.unlinkSync(runtimePath); } catch (_) {}
});

await import(pathToFileURL(runtimePath).href);
