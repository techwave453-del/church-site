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
const dbDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(path.join(dbDir, 'site.db'));
db.pragma('journal_mode = WAL');

function ensureDefaultSiteContent() {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)'
  );

  Object.entries(DEFAULT_SITE_CONTENT).forEach(([key, value]) => {
    insert.run(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
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

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const row = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

  if (!row) {
    db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
      username,
      bcrypt.hashSync(password, 10),
      'admin'
    );
  } else if (!bcrypt.compareSync(password, row.password_hash) || row.role !== 'admin') {
    db.prepare('UPDATE admin_users SET password_hash = ?, role = ? WHERE username = ?').run(
      bcrypt.hashSync(password, 10),
      'admin',
      username
    );
  }

  ensureDefaultSiteContent();
}

initDatabase();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'aic-kitanga-admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 12 }
  })
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || 'file');
    const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use('/uploads', express.static(uploadDir));

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

function parseStoredValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return JSON.parse(trimmed);
    }
  } catch (_error) {
    return value;
  }
  return value;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aic-kitanga-admin' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ ok: true, user: req.session.user });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/admin/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true, user: req.session.user });
});

app.get('/api/site/content', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_content').all();
  const payload = {};

  rows.forEach(({ key, value }) => {
    payload[key] = parseStoredValue(value);
  });

  res.json(mergeSiteContent(payload));
});

app.put('/api/site/content', requireAdmin, (req, res) => {
  const payload = req.body || {};
  const update = db.prepare(
    'INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );

  Object.entries(payload).forEach(([key, value]) => {
    update.run(key, typeof value === 'string' ? value : JSON.stringify(value));
  });

  res.json({ ok: true });
});

app.get('/api/media', (_req, res) => {
  const rows = db.prepare('SELECT * FROM media_items ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/media', requireAdmin, upload.single('file'), (req, res) => {
  const file = req.file;
  const { title, description, category, type } = req.body || {};

  if (!file) {
    return res.status(400).json({ error: 'Please select a file to upload.' });
  }

  const mediaType = type || (file.mimetype.startsWith('video/') ? 'video' : file.mimetype.startsWith('audio/') ? 'audio' : 'image');
  const item = {
    title: title || path.basename(file.originalname, path.extname(file.originalname)),
    description: description || '',
    category: category || 'general',
    type: mediaType,
    url: `/uploads/${file.filename}`,
    file_path: file.path
  };

  const result = db.prepare(
    'INSERT INTO media_items (title, type, category, description, url, file_path) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(item.title, item.type, item.category, item.description, item.url, item.file_path);

  res.status(201).json({ id: result.lastInsertRowid, ...item });
});

app.delete('/api/media/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM media_items WHERE id = ?').get(Number(id));

  if (!item) {
    return res.status(404).json({ error: 'Media item not found.' });
  }

  if (item.file_path && fs.existsSync(item.file_path)) {
    fs.unlinkSync(item.file_path);
  }

  db.prepare('DELETE FROM media_items WHERE id = ?').run(Number(id));
  res.json({ ok: true });
});

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/admin', (_req, res) => {
  const htmlPath = fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html');
  res.sendFile(htmlPath);
});

app.get(/^\/admin(?:\/.*)?$/, (_req, res) => {
  const htmlPath = fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html');
  res.sendFile(htmlPath);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  const htmlPath = fs.existsSync(indexPath) ? indexPath : path.join(__dirname, 'index.html');
  res.sendFile(htmlPath);
});

app.listen(port, () => {
  console.log(`AIC Kitanga admin server running on http://localhost:${port}`);
});
