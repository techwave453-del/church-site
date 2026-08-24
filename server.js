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
import { ADMIN_ROLES, hasPermission, rolePermissions, sanitizeAdminUser, validatePassword, hashPassword, normalizeUsername } from './admin-rbac.js';

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
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'church-media';

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
function parseStoredValue(value) { if (typeof value !== 'string') return value; const trimmed = value.trim(); if (!trimmed) return ''; try { if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return JSON.parse(trimmed); } catch (_) {} return value; }
async function ensureDefaultSiteContent() {
  if (useSupabase) { const rows = Object.entries(DEFAULT_SITE_CONTENT).map(([key, value]) => ({ key, value: typeof value === 'string' ? value : JSON.stringify(value) })); const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key', ignoreDuplicates: true }); if (error) throw error; return; }
  const insert = sqlite.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)'); Object.entries(DEFAULT_SITE_CONTENT).forEach(([key, value]) => insert.run(key, typeof value === 'string' ? value : JSON.stringify(value)));
}
async function initDatabase() {
  if (useSupabase) { await ensureSupabaseDatabase(); await ensureSupabaseStorage(); return; }
  sqlite.exec(`CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'admin');CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE IF NOT EXISTS media_items (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,type TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'general',description TEXT DEFAULT '',url TEXT NOT NULL,file_path TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
}
async function ensureAdminUser() {
  const username = normalizeUsername(process.env.ADMIN_USERNAME || (isProduction ? null : 'admin')); const password = process.env.ADMIN_PASSWORD || (isProduction ? null : 'admin123'); if (!username || !password) throw new Error('Admin credentials are required.');
  if (useSupabase) { const { data: row, error } = await supabase.from('admin_users').select('*').eq('username', username).maybeSingle(); if (error) throw error; const hash = bcrypt.hashSync(password, 12); if (!row) { const result = await supabase.from('admin_users').insert({ username, password_hash: hash, role: ADMIN_ROLES.SUPER_ADMIN, is_active: true }).select().single(); if (result.error) throw result.error; } else { const result = await supabase.from('admin_users').update({ role: ADMIN_ROLES.SUPER_ADMIN, is_active: row.is_active !== false, password_hash: bcrypt.compareSync(password, row.password_hash) ? row.password_hash : hash }).eq('id', row.id); if (result.error) throw result.error; } return; }
  const row = sqlite.prepare('SELECT * FROM admin_users WHERE username = ?').get(username); if (!row) sqlite.prepare('INSERT INTO admin_users (username,password_hash,role) VALUES (?,?,?)').run(username,hashPassword(password),ADMIN_ROLES.SUPER_ADMIN); else if (row.role !== ADMIN_ROLES.SUPER_ADMIN || !bcrypt.compareSync(password,row.password_hash)) sqlite.prepare('UPDATE admin_users SET password_hash=?,role=? WHERE username=?').run(bcrypt.compareSync(password,row.password_hash)?row.password_hash:hashPassword(password),ADMIN_ROLES.SUPER_ADMIN,username);
}
async function getAssignedPermissions(userId) { if (useSupabase) { const { data, error } = await supabase.from('admin_permissions').select('permission').eq('user_id', userId); if (error) { if (/relation .*admin_permissions.* does not exist/i.test(error.message || '')) return []; throw error; } return (data || []).map(row => row.permission); } return []; }
async function getAdminWithPermissions(user) { if (!user) return null; const permissions = await getAssignedPermissions(user.id); return { ...user, permissions: [...rolePermissions(user, permissions)] }; }
async function dbGetAdmin(username) { if (useSupabase) return (await supabase.from('admin_users').select('*').eq('username', username).maybeSingle()).data; return sqlite.prepare('SELECT * FROM admin_users WHERE username=?').get(username); }
async function updateLastLogin(userId) { if (useSupabase) { const { error } = await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', userId); if (error && !/column .*last_login_at.* does not exist/i.test(error.message || '')) console.error(error); return; } }
function adminPermission(permission) { return async (req,res,next) => { if (!req.session.user) return res.status(401).json({error:'Unauthorized. Please log in.'}); try { const user = await dbGetAdmin(req.session.user.username); if (!user || user.is_active === false) return res.status(403).json({error:'Admin account is disabled.'}); const permissions = await getAssignedPermissions(user.id); if (!hasPermission(user, permission, permissions)) return res.status(403).json({error:'You do not have permission to perform this action.'}); req.adminUser = user; req.adminPermissions = [...rolePermissions(user, permissions)]; next(); } catch (error) { console.error(error); res.status(500).json({error:'Unable to verify admin permissions.'}); } }; }
function requireAdmin(req,res,next){if(!req.session.user)return res.status(401).json({error:'Unauthorized. Please log in.'});next();}
function requireSameOrigin(req,res,next){const origin=req.get('Origin');const host=req.get('Host');if(!origin)return next();try{const originUrl=new URL(origin);if(originUrl.host!==host||!['http:','https:'].includes(originUrl.protocol))return res.status(403).json({error:'Cross-site request blocked.'});}catch(_error){return res.status(403).json({error:'Invalid request origin.'});}next();}
const loginAttempts=new Map(),LOGIN_WINDOW_MS=15*60*1000,LOGIN_MAX_ATTEMPTS=10;function loginKey(req){return`${req.ip}:${String(req.body?.username||'').trim().toLowerCase()}`;}function isRateLimited(key){const entry=loginAttempts.get(key);if(!entry||Date.now()-entry.startedAt>LOGIN_WINDOW_MS){loginAttempts.delete(key);return false;}return entry.count>=LOGIN_MAX_ATTEMPTS;}function recordFailedLogin(key){const now=Date.now(),entry=loginAttempts.get(key);if(!entry||now-entry.startedAt>LOGIN_WINDOW_MS)loginAttempts.set(key,{startedAt:now,count:1});else entry.count+=1;}function clearLoginAttempts(key){loginAttempts.delete(key);}
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'aic-kitanga-admin',database:useSupabase?'supabase':'sqlite'}));
app.post('/api/admin/login',requireSameOrigin,async(req,res)=>{try{const{username,password}=req.body||{},key=loginKey(req);if(isRateLimited(key))return res.status(429).json({error:'Too many login attempts. Please try again later.'});const user=await dbGetAdmin(normalizeUsername(username));if(!user||user.is_active===false||!bcrypt.compareSync(password||'',user.password_hash)){recordFailedLogin(key);return res.status(401).json({error:'Invalid username or password.'});}clearLoginAttempts(key);await updateLastLogin(user.id);const fullUser=await getAdminWithPermissions(user);req.session.regenerate(error=>{if(error)return res.status(500).json({error:'Unable to create a secure session.'});req.session.user={id:user.id,username:user.username,role:user.role,permissions:fullUser.permissions};res.json({ok:true,user:sanitizeAdminUser(user)});});}catch(error){console.error(error);res.status(500).json({error:'Unable to log in.'});}});
app.post('/api/admin/logout',requireSameOrigin,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/admin/session',async(req,res)=>{if(!req.session.user)return res.status(401).json({loggedIn:false});try{const user=await dbGetAdmin(req.session.user.username);if(!user||user.is_active===false)return req.session.destroy(()=>res.status(401).json({loggedIn:false}));const fullUser=await getAdminWithPermissions(user);req.session.user={id:user.id,username:user.username,role:user.role,permissions:fullUser.permissions};res.json({loggedIn:true,user:sanitizeAdminUser(user),permissions:fullUser.permissions});}catch(error){console.error(error);res.status(500).json({error:'Unable to load admin session.'});}});
app.get('/api/admin/me',requireAdmin,async(req,res)=>{try{const user=await dbGetAdmin(req.session.user.username);if(!user||user.is_active===false)return res.status(403).json({error:'Admin account is disabled.'});const fullUser=await getAdminWithPermissions(user);res.json({user:sanitizeAdminUser(user),permissions:fullUser.permissions});}catch(error){console.error(error);res.status(500).json({error:'Unable to load admin account.'});}});
app.get('/api/site/content',async(_req,res)=>{try{res.json(await getSiteContent());}catch(error){console.error(error);res.status(500).json({error:'Unable to load site content.'});}});
app.put('/api/site/content',requireSameOrigin,adminPermission('site.edit'),async(req,res)=>{try{await saveSiteContent(req.body||{});res.json({ok:true});}catch(error){console.error(error);res.status(500).json({error:'Unable to save site content.'});}});
app.get('/api/live/comments',async(_req,res)=>{try{res.json(await listLiveComments());}catch(error){console.error(error);res.status(500).json({error:'Unable to load live comments.'});}});
app.post('/api/live/comments',requireSameOrigin,async(req,res)=>{try{const item=await addLiveComment(req.body?.name,req.body?.comment);res.status(201).json(item);}catch(error){console.error(error);res.status(400).json({error:error.message||'Unable to post comment.'});}});
app.get('/api/admin/live/comments',adminPermission('comments.view'),async(_req,res)=>{try{res.json(await listLiveComments({admin:true}));}catch(error){console.error(error);res.status(500).json({error:'Unable to load live comments.'});}});
app.patch('/api/admin/live/comments/:id',requireSameOrigin,adminPermission('comments.moderate'),async(req,res)=>{try{const item=await moderateLiveComment(req.params.id,req.body?.approved);res.json(item);}catch(error){console.error(error);res.status(400).json({error:error.message||'Unable to update comment.'});}});
app.delete('/api/admin/live/comments/:id',requireSameOrigin,adminPermission('comments.moderate'),async(req,res)=>{try{await deleteLiveComment(req.params.id);res.json({ok:true});}catch(error){console.error(error);res.status(400).json({error:error.message||'Unable to delete comment.'});}});
app.get('/api/media',async(_req,res)=>{try{res.json(await listMedia());}catch(error){console.error(error);res.status(500).json({error:'Unable to load media.'});}});
app.post('/api/media',requireSameOrigin,adminPermission('media.upload'),upload.single('file'),async(req,res)=>{try{const file=req.file;if(!file)return res.status(400).json({error:'Please select a file to upload.'});const{title,description,category,type}=req.body||{},inferredType=file.mimetype.startsWith('video/')?'video':file.mimetype.startsWith('audio/')?'audio':file.mimetype==='application/pdf'?'document':'image',mediaType=['image','video','audio','document'].includes(type)?type:inferredType;if(useSupabase){const safeName=(file.originalname||'file').replace(/[^a-zA-Z0-9._-]/g,'-');const storagePath=`uploads/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;const blob=new Blob([file.buffer],{type:file.mimetype});const uploaded=await supabase.storage.from(STORAGE_BUCKET).upload(storagePath,blob,{contentType:file.mimetype,cacheControl:'3600',upsert:false});if(uploaded.error)throw uploaded.error;const url=supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;const item=await addMedia({title:title||path.basename(file.originalname,path.extname(file.originalname)),description:description||'',category:category||'general',type:mediaType,url,storage_path:storagePath});return res.status(201).json(item);}const filename=`${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(file.originalname||'file').toLowerCase()}`;const filePath=path.join(uploadDir,filename);fs.writeFileSync(filePath,file.buffer);const item=await addMedia({title:title||path.basename(file.originalname,path.extname(file.originalname)),description:description||'',category:category||'general',type:mediaType,url:`/uploads/${filename}`,file_path:filePath});res.status(201).json(item);}catch(error){console.error(error);res.status(500).json({error:error.message||'Upload failed.'});}});
app.patch('/api/media/:id',requireSameOrigin,adminPermission('media.edit'),async(req,res)=>{try{const item=await updateMedia(req.params.id,req.body||{});if(!item)return res.status(404).json({error:'Media item not found.'});res.json(item);}catch(error){console.error(error);res.status(400).json({error:error.message||'Unable to update media.'});}});
app.delete('/api/media/:id',requireSameOrigin,adminPermission('media.delete'),async(req,res)=>{try{const item=await findMedia(req.params.id);if(!item)return res.status(404).json({error:'Media item not found.'});await removeMedia(req.params.id,item);res.json({ok:true});}catch(error){console.error(error);res.status(500).json({error:'Delete failed.'});}});
const distPath=path.join(__dirname,'dist'),indexPath=path.join(distPath,'index.html');if(fs.existsSync(distPath))app.use(express.static(distPath));app.use('/admin',express.static(path.join(__dirname,'admin')));if(!useSupabase)app.use('/uploads',express.static(uploadDir));app.get('/admin',(_req,res)=>res.sendFile(path.join(__dirname,'admin.html')));app.get(/^\/admin(?:\/.*)?$/,(req,res)=>res.sendFile(path.join(__dirname,'admin.html')));app.use((req,res,next)=>{if(req.path.startsWith('/api')||req.path.startsWith('/uploads'))return next();res.sendFile(fs.existsSync(indexPath)?indexPath:path.join(__dirname,'index.html'));});app.use((err,_req,res,_next)=>{if(err instanceof multer.MulterError||err?.message?.startsWith('Unsupported file type'))return res.status(400).json({error:err.message});console.error(err);res.status(500).json({error:'Internal server error.'});});app.listen(port,'0.0.0.0',()=>console.log(`AIC Kitanga admin server running on http://0.0.0.0:${port} using ${useSupabase?'Supabase':'SQLite'}`));
