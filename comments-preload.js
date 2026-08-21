import express from 'express';
import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const originalListen = express.application.listen;
const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = useSupabase ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
const dbPath = path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'site.db');
let sqlite;
const getSqlite = () => { if (!sqlite) { fs.mkdirSync(path.dirname(dbPath), { recursive: true }); sqlite = new Database(dbPath); sqlite.exec('CREATE TABLE IF NOT EXISTS live_comments (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,comment TEXT NOT NULL,approved INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'); } return sqlite; };
const clean = (value, max) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
const isAdmin = req => Boolean(req.session?.user?.role === 'admin');

async function listComments(includePending = false) {
  if (useSupabase) {
    let query = supabase.from('live_comments').select('id,name,comment,approved,created_at').order('created_at', { ascending: false }).limit(200);
    if (!includePending) query = query.eq('approved', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  const sql = includePending ? 'SELECT id,name,comment,approved,created_at FROM live_comments ORDER BY created_at DESC LIMIT 200' : 'SELECT id,name,comment,approved,created_at FROM live_comments WHERE approved=1 ORDER BY created_at DESC LIMIT 200';
  return getSqlite().prepare(sql).all();
}

async function addComment(name, comment) {
  if (useSupabase) {
    const { data, error } = await supabase.from('live_comments').insert({ name, comment, approved: true }).select('id,name,comment,approved,created_at').single();
    if (error) throw error;
    return data;
  }
  const result = getSqlite().prepare('INSERT INTO live_comments (name,comment,approved) VALUES (?,?,1)').run(name, comment);
  return getSqlite().prepare('SELECT id,name,comment,approved,created_at FROM live_comments WHERE id=?').get(result.lastInsertRowid);
}

async function removeComment(id) {
  if (useSupabase) { const { error } = await supabase.from('live_comments').delete().eq('id', Number(id)); if (error) throw error; return; }
  getSqlite().prepare('DELETE FROM live_comments WHERE id=?').run(Number(id));
}

express.application.listen = function (...args) {
  this.get('/api/live/comments', async (_req, res) => { try { res.json(await listComments(false)); } catch (error) { console.error('Live comments read failed:', error); res.status(500).json({ error: 'Unable to load comments.' }); } });
  this.post('/api/live/comments', async (req, res) => { try { const name = clean(req.body?.name, 60); const comment = clean(req.body?.comment, 500); if (!name || !comment) return res.status(400).json({ error: 'Please enter your name and comment.' }); const created = await addComment(name, comment); res.status(201).json(created); } catch (error) { console.error('Live comment save failed:', error); res.status(500).json({ error: 'Unable to post comment right now.' }); } });
  this.get('/api/admin/live-comments', async (req, res) => { if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized.' }); try { res.json(await listComments(true)); } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load comments.' }); } });
  this.delete('/api/admin/live-comments/:id', (req, res, next) => { if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized.' }); removeComment(req.params.id).then(() => res.json({ ok: true })).catch(next); });
  this.get('/admin/comments', (req, res) => {
    if (!isAdmin(req)) return res.status(401).send('<!doctype html><meta name="viewport" content="width=device-width"><p style="font-family:system-ui;padding:30px">Please sign in through the <a href="/admin">admin panel</a> first.</p>');
    res.type('html').send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Live Comments — Admin</title><style>body{font:15px system-ui;margin:0;background:#f5f7f9;color:#18202a}.wrap{max-width:900px;margin:30px auto;padding:0 16px}.card{background:#fff;border:1px solid #e2e7eb;border-radius:14px;padding:20px;margin-bottom:14px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center}.top a{color:#075da8;text-decoration:none}.comment{border-top:1px solid #eee;padding:16px 0}.comment:first-child{border-top:0}.meta{color:#66717d;font-size:12px}.comment p{white-space:pre-wrap}.delete{background:#b42318;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}.empty{color:#66717d;text-align:center;padding:25px}</style></head><body><main class="wrap"><div class="top"><div><h1>Live Comments</h1><p>Manage comments posted below the live stream.</p></div><a href="/admin">← Admin panel</a></div><section class="card"><div id="list">Loading…</div></section></main><script>const esc=v=>String(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));async function load(){const r=await fetch('/api/admin/live-comments',{credentials:'include'});if(!r.ok){document.getElementById('list').textContent='Unable to load comments.';return}const a=await r.json();document.getElementById('list').innerHTML=a.length?a.map(x=>'<article class="comment"><div class="meta"><strong>'+esc(x.name)+'</strong> · '+new Date(x.created_at).toLocaleString()+'</div><p>'+esc(x.comment)+'</p><button class="delete" onclick="del('+x.id+')">Delete</button></article>').join(''):'<div class="empty">No comments yet.</div>'}async function del(id){if(!confirm('Delete this comment?'))return;const r=await fetch('/api/admin/live-comments/'+id,{method:'DELETE',credentials:'include'});if(r.ok)load();}load();</script></body></html>`);
  });
  return originalListen.apply(this, args);
};
