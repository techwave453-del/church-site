import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const expressPath = require.resolve('express');
const originalExpress = require(expressPath);
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function attachCommentRoutes(app) {
  app.get('/api/live/comments', async (_req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Comments are temporarily unavailable.' });
    try {
      const { data, error } = await supabase.from('live_comments').select('id,name,comment,created_at').eq('approved', true).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      res.json({ comments: data || [] });
    } catch (error) {
      console.error('Live comments read failed:', error);
      res.status(500).json({ error: 'Unable to load comments.' });
    }
  });

  app.post('/api/live/comments', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Comments are temporarily unavailable.' });
    try {
      const name = String(req.body?.name || '').trim().slice(0, 60);
      const comment = String(req.body?.comment || '').trim().slice(0, 500);
      if (!name || !comment) return res.status(400).json({ error: 'Please provide your name and comment.' });
      const { data, error } = await supabase.from('live_comments').insert({ name, comment, approved: true }).select('id,name,comment,created_at').single();
      if (error) throw error;
      res.status(201).json({ comment: data });
    } catch (error) {
      console.error('Live comment create failed:', error);
      res.status(500).json({ error: 'Unable to post your comment.' });
    }
  });

  app.delete('/api/live/comments/:id', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: 'Comments are temporarily unavailable.' });
    if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    try {
      const { error } = await supabase.from('live_comments').delete().eq('id', Number(req.params.id));
      if (error) throw error;
      res.json({ ok: true });
    } catch (error) {
      console.error('Live comment delete failed:', error);
      res.status(500).json({ error: 'Unable to delete comment.' });
    }
  });
}

function patchedExpress(...args) {
  const app = originalExpress(...args);
  attachCommentRoutes(app);
  return app;
}
Object.assign(patchedExpress, originalExpress);
for (const key of ['Router', 'json', 'urlencoded', 'static', 'raw', 'text']) patchedExpress[key] = originalExpress[key];
require.cache[expressPath].exports = patchedExpress;
await import('./server.js');
