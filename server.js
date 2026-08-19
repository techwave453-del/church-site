import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from './site-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const dbDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

if (isProduction) {
  const required = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'SESSION_SECRET'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  if (process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters in production.');
}

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(path.join(dbDir, 'site.db'));
db.pragma('journal_mode = WAL');

function ensureDefaultSiteContent() {
  const insert = db.prepare('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)');
  Object.entries(DEFAULT_SITE_CONTENT).forEach(([key, value]) => insert.run(key, typeof value === 'string' ? value : JSON.stringify(value)));
}

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin'
    );
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS media_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      description TEXT DEFAULT '',
      url TEXT NOT NULL,
      file_path TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const username = process.env.ADMIN_USERNAME || (isProduction ? null : 'admin');
  const password = process.env.ADMIN_PASSWORD || (isProduction ? null : 'admin123');
  if (!username || !password) throw new Error('Admin credentials are required.');
  const row = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!row) {
    db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(username, bcrypt.hashSync(password, 10), 'admin');
  } else if (!bcrypt.compareSync(password, row.password_hash) || row.role !== 'admin') {
    db.prepare('UPDATE admin_users SET password_hash = ?, role = ? WHERE username = ?').run(bcrypt.hashSync(password, 10), 'admin', username);
  }
  ensureDefaultSiteContent();
}

initDatabase();

const app = express();
const port = process.env.PORT || 3001;
if (isProduction) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-only-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 12, httpOnly: true, sameSite: 'lax', secure: isProduction }
}));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || 'file').toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  }
});
const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/mp4',
  'audio/wav', 'audio/ogg', 'audio/webm', 'application/pdf'
]);
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => allowedMimeTypes.has(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Unsupported file type. Upload an image, video, audio file, or PDF.'))
});

app.use('/uploads', express.static(uploadDir));
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  next();
}
function parseStoredValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return JSON.parse(trimmed);
  } catch (_error) { return value; }
  return value;
}

const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
function loginKey(req) { return `${req.ip}:${String(req.body?.username || '').trim().toLowerCase()}`; }
function isRateLimited(key) {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() - entry.startedAt > LOGIN_WINDOW_MS) { loginAttempts.delete(key); return false; }
  return entry.count >= LOGIN_MAX_ATTEMPTS;
}
function recordFailedLogin(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.startedAt > LOGIN_WINDOW_MS) loginAttempts.set(key, { startedAt: now, count: 1 });
  else entry.count += 1;
}
function clearLoginAttempts(key) { loginAttempts.delete(key); }

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'aic-kitanga-admin' }));

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const key = loginKey(req);
  if (isRateLimited(key)) return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    recordFailedLogin(key);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  clearLoginAttempts(key);
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ error: 'Unable to create a secure session.' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ ok: true, user: req.session.user });
  });
});

app.post('/api/admin/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));
app.get('/api/admin/session', (req, res) => {
  if (!req.session.user) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});
app.get('/api/site/content', (_req, res) => {
  const payload = {};
  db.prepare('SELECT key, value FROM site_content').all().forEach(({ key, value }) => { payload[key] = parseStoredValue(value); });
  res.json(mergeSiteContent(payload));
});
app.put('/api/site/content', requireAdmin, (req, res) => {
  const update = db.prepare('INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  Object.entries(req.body || {}).forEach(([key, value]) => update.run(key, typeof value === 'string' ? value : JSON.stringify(value)));
  res.json({ ok: true });
});
app.get('/api/media', (_req, res) => res.json(db.prepare('SELECT id, title, type, category, description, url, created_at FROM media_items ORDER BY created_at DESC').all()));
app.post('/api/media', requireAdmin, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Please select a file to upload.' });
  const { title, description, category, type } = req.body || {};
  const inferredType = file.mimetype.startsWith('video/') ? 'video' : file.mimetype.startsWith('audio/') ? 'audio' : file.mimetype === 'application/pdf' ? 'document' : 'image';
  const mediaType = ['image', 'video', 'audio', 'document'].includes(type) ? type : inferredType;
  const item = { title: title || path.basename(file.originalname, path.extname(file.originalname)), description: description || '', category: category || 'general', type: mediaType, url: `/uploads/${file.filename}` };
  const result = db.prepare('INSERT INTO media_items (title, type, category, description, url, file_path) VALUES (?, ?, ?, ?, ?, ?)').run(item.title, item.type, item.category, item.description, item.url, file.path);
  res.status(201).json({ id: result.lastInsertRowid, ...item });
});
app.delete('/api/media/:id', requireAdmin, (req, res) => {
  const item = db.prepare('SELECT * FROM media_items WHERE id = ?').get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Media item not found.' });
  if (item.file_path && fs.existsSync(item.file_path)) fs.unlinkSync(item.file_path);
  db.prepare('DELETE FROM media_items WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(distPath)) app.use(express.static(distPath));
app.get('/admin', (_req, res) => res.sendFile(fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html')));
app.get(/^\/admin(?:\/.*)?$/, (_req, res) => res.sendFile(fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html')));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html'));
});
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err?.message?.startsWith('Unsupported file type')) return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});
app.listen(port, '0.0.0.0', () => console.log(`AIC Kitanga admin server running on http://0.0.0.0:${port}`));