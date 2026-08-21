import { createClient } from '@supabase/supabase-js';
import express from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
const originalExpress = express;

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
}

function patchedExpress(...args) {
  const app = originalExpress(...args);
  attachCommentRoutes(app);
  return app;
}
Object.assign(patchedExpress, originalExpress);
patchedExpress.Router = originalExpress.Router;
patchedExpress.json = originalExpress.json;
patchedExpress.urlencoded = originalExpress.urlencoded;
patchedExpress.static = originalExpress.static;

const expressModule = await import('express');
if (expressModule.default === originalExpress) expressModule.default = patchedExpress;
