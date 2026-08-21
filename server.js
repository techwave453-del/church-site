import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from './site-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const dbDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

if (isProduction) {
  const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'SESSION_SECRET'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  if (process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters in production.');
  if (!useSupabase) console.warn('Supabase environment variables are not configured; temporarily using SQLite. Configure Supabase before the next production redeploy to make data persistent.');
}

if (!useSupabase) {
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(uploadDir, { recursive: true });
}

const supabase = useSupabase
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'church-media';

// SQLite is retained only as a migration bridge for an existing installation.
const sqlite = fs.existsSync(path.join(dbDir, 'site.db'))
  ? new Database(path.join(dbDir, 'site.db'))
  : (!useSupabase ? new Database(path.join(dbDir, 'site.db')) : null);
if (sqlite) sqlite.pragma('journal_mode = WAL');

async function ensureSupabaseStorage() {
  if (!supabase) return;
  const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);
  if (!error && data) return;
  const created = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true, fileSizeLimit: '50MB' });
  if (created.error && !/already exists/i.test(created.error.message || '')) throw new Error(`Unable to create Supabase storage bucket: ${created.error.message}`);
}

async function ensureSupabaseDatabase() {
  if (!supabase) return;
  const { error } = await supabase.from('site_content').select('key').limit(1);
  if (error) throw new Error(`Supabase schema is not ready. Run supabase-schema.sql in the Supabase SQL Editor. ${error.message}`);
}

function parseStoredValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try { if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return JSON.parse(trimmed); } catch (_) {}
  return value;
}

async function ensureDefaultSiteContent() {
  if (useSupabase) {
    const rows = Object.entries(DEFAULT_SITE_CONTENT).map(([key, value]) => ({ key, value: typeof value === 'string' ? value : JSON.stringify(value) }));
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key', ignoreDuplicates: true });
    if (error) throw error;
    return;
  }
  const insert = sqlite.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
  Object.entries(DEFAULT_SITE_CONTENT).forEach(([key, value]) => insert.run(key, typeof value === 'string' ? value : JSON.stringify(value)));
}

async function initDatabase() {
  if (useSupabase) { await ensureSupabaseDatabase(); await ensureSupabaseStorage(); return; }
  sqlite.exec(`CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'admin');CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE IF NOT EXISTS media_items (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,type TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'general',description TEXT DEFAULT '',url TEXT NOT NULL,file_path TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
}

async function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME || (isProduction ? null : 'admin');
  const password = process.env.ADMIN_PASSWORD || (isProduction ? null : 'admin123');
  if (!username || !password) throw new Error('Admin credentials are required.');
  if (useSupabase) {
    const { data: row, error } = await supabase.from('admin_users').select('*').eq('username', username).maybeSingle();
    if (error) throw error;
    const hash = bcrypt.hashSync(password, 10);
    if (!row) { const result = await supabase.from('admin_users').insert({ username, password_hash: hash, role: 'admin' }).select().single(); if (result.error) throw result.error; }
    else if (!bcrypt.compareSync(password, row.password_hash) || row.role !== 'admin') { const result = await supabase.from('admin_users').update({ password_hash: hash, role: 'admin' }).eq('id', row.id); if (result.error) throw result.error; }
    return;
  }
  const row = sqlite.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!row) sqlite.prepare('INSERT INTO admin_users (username,password_hash,role) VALUES (?,?,?)').run(username,bcrypt.hashSync(password,10),'admin');
  else if (!bcrypt.compareSync(password,row.password_hash) || row.role !== 'admin') sqlite.prepare('UPDATE admin_users SET password_hash=?,role=? WHERE username=?').run(bcrypt.hashSync(password,10),'admin',username);
}

function mimeFromExt(ext) { return ({'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.ogg':'audio/ogg','.pdf':'application/pdf'})[ext] || 'application/octet-stream'; }

async function migrateSqliteIfPresent() {
  if (!useSupabase || !sqlite) return;
  console.log('Existing SQLite database found; starting one-time Supabase migration.');
  const content = sqlite.prepare('SELECT key,value FROM site_content').all();
  if (content.length) { const { error } = await supabase.from('site_content').upsert(content, { onConflict: 'key' }); if (error) throw error; }
  const users = sqlite.prepare('SELECT username,password_hash,role FROM admin_users').all();
  for (const user of users) { const existing = await supabase.from('admin_users').select('id').eq('username', user.username).maybeSingle(); if (existing.error) throw existing.error; if (!existing.data) { const inserted = await supabase.from('admin_users').insert(user); if (inserted.error) throw inserted.error; } }
  const media = sqlite.prepare('SELECT id,title,type,category,description,url,file_path,created_at FROM media_items ORDER BY id').all();
  for (const item of media) {
    const existing = await supabase.from('media_items').select('id').eq('legacy_id', item.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) continue;
    let url = item.url, storagePath = null;
    if (item.file_path && fs.existsSync(item.file_path)) {
      const ext = path.extname(item.file_path).toLowerCase() || '.bin'; storagePath = `migrated/${item.id}-${Date.now()}${ext}`;
      const blob = new Blob([fs.readFileSync(item.file_path)], { type: mimeFromExt(ext) });
      const uploaded = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, blob, { contentType: mimeFromExt(ext), upsert: false });
      if (uploaded.error) throw uploaded.error;
      url = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
    }
    const inserted = await supabase.from('media_items').insert({ legacy_id: item.id, title: item.title, type: item.type, category: item.category, description: item.description || '', url, storage_path: storagePath, created_at: item.created_at }).select().single();
    if (inserted.error) throw inserted.error;
  }
  console.log('SQLite migration completed successfully.');
}

async function dbGetAdmin(username) { if (useSupabase) return (await supabase.from('admin_users').select('*').eq('username', username).maybeSingle()).data; return sqlite.prepare('SELECT * FROM admin_users WHERE username=?').get(username); }
async function getSiteContent() { if (useSupabase) { const { data,error } = await supabase.from('site_content').select('key,value'); if(error) throw error; const payload={}; for(const row of data||[]) payload[row.key]=parseStoredValue(row.value); return mergeSiteContent(payload); } const payload={}; sqlite.prepare('SELECT key,value FROM site_content').all().forEach(({key,value})=>{payload[key]=parseStoredValue(value);}); return mergeSiteContent(payload); }
async function saveSiteContent(body) { const rows=Object.entries(body||{}).map(([key,value])=>({key,value:typeof value==='string'?value:JSON.stringify(value)})); if(useSupabase){const{error}=await supabase.from('site_content').upsert(rows,{onConflict:'key'});if(error)throw error;return;} const update=sqlite.prepare('INSERT INTO site_content (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'); sqlite.transaction(()=>rows.forEach(row=>update.run(row.key,row.value)))(); }
async function listMedia() { if(useSupabase){const{data,error}=await supabase.from('media_items').select('id,title,type,category,description,url,created_at').order('created_at',{ascending:false});if(error)throw error;return data||[];} return sqlite.prepare('SELECT id,title,type,category,description,url,created_at FROM media_items ORDER BY created_at DESC').all(); }
async function addMedia(item) { if(useSupabase){const{data,error}=await supabase.from('media_items').insert(item).select('id,title,type,category,description,url,created_at').single();if(error)throw error;return data;} const result=sqlite.prepare('INSERT INTO media_items (title,type,category,description,url,file_path) VALUES (?,?,?,?,?,?)').run(item.title,item.type,item.category,item.description,item.url,item.file_path||null);return{id:result.lastInsertRowid,title:item.title,type:item.type,category:item.category,description:item.description,url:item.url}; }
async function findMedia(id) { if(useSupabase)return(await supabase.from('media_items').select('*').eq('id',Number(id)).maybeSingle()).data; return sqlite.prepare('SELECT * FROM media_items WHERE id=?').get(Number(id)); }
async function removeMedia(id,item) { if(useSupabase){if(item.storage_path){const removed=await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]);if(removed.error)console.error('Storage delete failed:',removed.error);}const{error}=await supabase.from('media_items').delete().eq('id',Number(id));if(error)throw error;return;}if(item.file_path&&fs.existsSync(item.file_path))fs.unlinkSync(item.file_path);sqlite.prepare('DELETE FROM media_items WHERE id=?').run(Number(id)); }

await initDatabase();
if (useSupabase) await migrateSqliteIfPresent();
await ensureAdminUser();
await ensureDefaultSiteContent();

const app=express(); const port=process.env.PORT||3001; if(isProduction)app.set('trust proxy',1); app.disable('x-powered-by');
app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');if(isProduction)res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');next();});
app.use(express.json({limit:'1mb'})); app.use(express.urlencoded({extended:true,limit:'1mb'})); app.use(session({secret:process.env.SESSION_SECRET||'development-only-session-secret',resave:false,saveUninitialized:false,cookie:{maxAge:1000*60*60*12,httpOnly:true,sameSite:'lax',secure:isProduction}}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:50*1024*1024},fileFilter:(_req,file,cb)=>new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/wav','audio/ogg','audio/webm','application/pdf']).has(file.mimetype)?cb(null,true):cb(new Error('Unsupported file type. Upload an image, video, audio file, or PDF.'))});
function requireAdmin(req,res,next){if(!req.session.user)return res.status(401).json({error:'Unauthorized. Please log in.'});next();} function requireSameOrigin(req,res,next){const origin=req.get('Origin');const host=req.get('Host');if(!origin)return next();try{const originUrl=new URL(origin);if(originUrl.host!==host||!['http:','https:'].includes(originUrl.protocol))return res.status(403).json({error:'Cross-site request blocked.'});}catch(_error){return res.status(403).json({error:'Invalid request origin.'});}next();}
const loginAttempts=new Map(),LOGIN_WINDOW_MS=15*60*1000,LOGIN_MAX_ATTEMPTS=10;function loginKey(req){return`${req.ip}:${String(req.body?.username||'').trim().toLowerCase()}`;}function isRateLimited(key){const entry=loginAttempts.get(key);if(!entry||Date.now()-entry.startedAt>LOGIN_WINDOW_MS){loginAttempts.delete(key);return false;}return entry.count>=LOGIN_MAX_ATTEMPTS;}function recordFailedLogin(key){const now=Date.now(),entry=loginAttempts.get(key);if(!entry||now-entry.startedAt>LOGIN_WINDOW_MS)loginAttempts.set(key,{startedAt:now,count:1});else entry.count+=1;}function clearLoginAttempts(key){loginAttempts.delete(key);}
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'aic-kitanga-admin',database:useSupabase?'supabase':'sqlite'}));
app.post('/api/admin/login',requireSameOrigin,async(req,res)=>{try{const{username,password}=req.body||{},key=loginKey(req);if(isRateLimited(key))return res.status(429).json({error:'Too many login attempts. Please try again later.'});const user=await dbGetAdmin(username);if(!user||!bcrypt.compareSync(password||'',user.password_hash)){recordFailedLogin(key);return res.status(401).json({error:'Invalid username or password.'});}clearLoginAttempts(key);req.session.regenerate(error=>{if(error)return res.status(500).json({error:'Unable to create a secure session.'});req.session.user={id:user.id,username:user.username,role:user.role};res.json({ok:true,user:req.session.user});});}catch(error){console.error(error);res.status(500).json({error:'Unable to log in.'});}});
app.post('/api/admin/logout',requireSameOrigin,(req,res)=>req.session.destroy(()=>res.json({ok:true})));app.get('/api/admin/session',(req,res)=>{if(!req.session.user)return res.status(401).json({loggedIn:false});res.json({loggedIn:true,user:req.session.user});});
app.get('/api/site/content',async(_req,res)=>{try{res.json(await getSiteContent());}catch(error){console.error(error);res.status(500).json({error:'Unable to load site content.'});}});app.put('/api/site/content',requireSameOrigin,requireAdmin,async(req,res)=>{try{await saveSiteContent(req.body||{});res.json({ok:true});}catch(error){console.error(error);res.status(500).json({error:'Unable to save site content.'});}});
app.get('/api/media',async(_req,res)=>{try{res.json(await listMedia());}catch(error){console.error(error);res.status(500).json({error:'Unable to load media.'});}});
app.post('/api/media',requireSameOrigin,requireAdmin,upload.single('file'),async(req,res)=>{try{const file=req.file;if(!file)return res.status(400).json({error:'Please select a file to upload.'});const{title,description,category,type}=req.body||{},inferredType=file.mimetype.startsWith('video/')?'video':file.mimetype.startsWith('audio/')?'audio':file.mimetype==='application/pdf'?'document':'image',mediaType=['image','video','audio','document'].includes(type)?type:inferredType;if(useSupabase){const safeName=(file.originalname||'file').replace(/[^a-zA-Z0-9._-]/g,'-');const storagePath=`uploads/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;const blob=new Blob([file.buffer],{type:file.mimetype});const uploaded=await supabase.storage.from(STORAGE_BUCKET).upload(storagePath,blob,{contentType:file.mimetype,cacheControl:'3600',upsert:false});if(uploaded.error)throw uploaded.error;const url=supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;const item=await addMedia({title:title||path.basename(file.originalname,path.extname(file.originalname)),description:description||'',category:category||'general',type:mediaType,url,storage_path:storagePath});return res.status(201).json(item);}const filename=`${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname||'file').toLowerCase()}`;const filePath=path.join(uploadDir,filename);fs.writeFileSync(filePath,file.buffer);const item=await addMedia({title:title||path.basename(file.originalname,path.extname(file.originalname)),description:description||'',category:category||'general',type:mediaType,url:`/uploads/${filename}`,file_path:filePath});res.status(201).json(item);}catch(error){console.error(error);res.status(500).json({error:error.message||'Upload failed.'});}});
app.delete('/api/media/:id',requireSameOrigin,requireAdmin,async(req,res)=>{try{const item=await findMedia(req.params.id);if(!item)return res.status(404).json({error:'Media item not found.'});await removeMedia(req.params.id,item);res.json({ok:true});}catch(error){console.error(error);res.status(500).json({error:'Delete failed.'});}});
const distPath=path.join(__dirname,'dist'),indexPath=path.join(distPath,'index.html');if(fs.existsSync(distPath))app.use(express.static(distPath));if(!useSupabase)app.use('/uploads',express.static(uploadDir));app.get('/admin',(_req,res)=>res.sendFile(path.join(__dirname,'admin.html')));app.get(/^\/admin(?:\/.*)?$/,(req,res)=>res.sendFile(path.join(__dirname,'admin.html')));app.use((req,res,next)=>{if(req.path.startsWith('/api')||req.path.startsWith('/uploads'))return next();res.sendFile(fs.existsSync(indexPath)?indexPath:path.join(__dirname,'index.html'));});app.use((err,_req,res,_next)=>{if(err instanceof multer.MulterError||err?.message?.startsWith('Unsupported file type'))return res.status(400).json({error:err.message});console.error(err);res.status(500).json({error:'Internal server error.'});});app.listen(port,'0.0.0.0',()=>console.log(`AIC Kitanga admin server running on http://0.0.0.0:${port} using ${useSupabase?'Supabase':'SQLite'}`));
