const EVENT_STATUSES = new Set(['draft', 'published', 'archived']);
const ATTENDANCE_TYPES = new Set(['in_person', 'online', 'hybrid']);

function slugify(value = '') {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}

function normalizeEvent(input = {}, existing = {}) {
  const title = String(input.title ?? existing.title ?? '').trim();
  const startAt = input.start_at ?? existing.start_at;
  if (!title) throw new Error('Event title is required.');
  if (!startAt) throw new Error('Event start date and time are required.');
  const rawStatus = input.status ?? existing.status ?? 'draft';
  const rawAttendance = input.attendance_type ?? existing.attendance_type ?? 'in_person';
  return {
    slug: slugify(input.slug ?? existing.slug ?? title), title,
    category: String(input.category ?? existing.category ?? 'General').trim(),
    short_description: String(input.short_description ?? existing.short_description ?? '').trim(),
    description: String(input.description ?? existing.description ?? '').trim(),
    image: String(input.image ?? existing.image ?? '').trim(),
    flyer_url: String(input.flyer_url ?? existing.flyer_url ?? '').trim(),
    start_at: startAt, end_at: input.end_at ?? existing.end_at ?? null,
    all_day: Boolean(input.all_day ?? existing.all_day ?? false),
    location: String(input.location ?? existing.location ?? '').trim(),
    address: String(input.address ?? existing.address ?? '').trim(),
    attendance_type: ATTENDANCE_TYPES.has(rawAttendance) ? rawAttendance : 'in_person',
    registration_url: String(input.registration_url ?? existing.registration_url ?? '').trim(),
    contact: String(input.contact ?? existing.contact ?? '').trim(),
    livestream_url: String(input.livestream_url ?? existing.livestream_url ?? '').trim(),
    featured: Boolean(input.featured ?? existing.featured ?? false),
    status: EVENT_STATUSES.has(rawStatus) ? rawStatus : 'draft',
    display_order: Number.isFinite(Number(input.display_order ?? existing.display_order ?? 0)) ? Number(input.display_order ?? existing.display_order ?? 0) : 0
  };
}

function ensureSqliteEventsTable(db) {
  if (!db) return;
  db.exec(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    short_description TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    flyer_url TEXT NOT NULL DEFAULT '',
    start_at TEXT NOT NULL,
    end_at TEXT,
    all_day INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    attendance_type TEXT NOT NULL DEFAULT 'in_person',
    registration_url TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    livestream_url TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS events_status_start_idx ON events(status, start_at);
  CREATE INDEX IF NOT EXISTS events_featured_idx ON events(featured);
  CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);`);
}

export function registerEventsRoutes(app, { db, supabase, requireAdmin }) {
  ensureSqliteEventsTable(db);
  const adminOnly = (req, res, next) => requireAdmin(req, res, next);
  const isAdminSession = req => Boolean(req.session?.user?.id || req.session?.adminUser?.id);

  app.get('/api/events', async (req, res) => {
    try {
      const includeUnpublished = isAdminSession(req);
      if (supabase) {
        let query = supabase.from('events').select('*').order('start_at', { ascending: true });
        if (!includeUnpublished) query = query.eq('status', 'published');
        const { data, error } = await query;
        if (error) throw error;
        return res.json(data || []);
      }
      const rows = includeUnpublished ? db.prepare('select * from events order by start_at asc').all() : db.prepare("select * from events where status='published' order by start_at asc").all();
      res.json(rows);
    } catch (_) { res.status(500).json({ error: 'Unable to load events.' }); }
  });

  app.get('/api/events/:slug', async (req, res) => {
    try {
      const includeUnpublished = isAdminSession(req);
      if (supabase) {
        let query = supabase.from('events').select('*').eq('slug', req.params.slug).limit(1);
        if (!includeUnpublished) query = query.eq('status', 'published');
        const { data, error } = await query;
        if (error) throw error;
        if (!data?.[0]) return res.status(404).json({ error: 'Event not found.' });
        return res.json(data[0]);
      }
      const row = includeUnpublished ? db.prepare('select * from events where slug=?').get(req.params.slug) : db.prepare("select * from events where slug=? and status='published'").get(req.params.slug);
      if (!row) return res.status(404).json({ error: 'Event not found.' });
      res.json(row);
    } catch (_) { res.status(500).json({ error: 'Unable to load event.' }); }
  });

  app.post('/api/admin/events', adminOnly, async (req, res) => {
    try {
      const event = normalizeEvent(req.body);
      if (supabase) {
        const { data, error } = await supabase.from('events').insert(event).select('*').single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      const result = db.prepare(`insert into events (${Object.keys(event).join(',')}) values (${Object.keys(event).map(k => '@'+k).join(',')})`).run(event);
      res.status(201).json(db.prepare('select * from events where id=?').get(result.lastInsertRowid));
    } catch (error) { res.status(400).json({ error: error.message || 'Unable to create event.' }); }
  });

  app.put('/api/admin/events/:id', adminOnly, async (req, res) => {
    try {
      let existing;
      if (supabase) {
        const result = await supabase.from('events').select('*').eq('id', req.params.id).maybeSingle();
        if (result.error) throw result.error;
        existing = result.data;
      } else existing = db.prepare('select * from events where id=?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Event not found.' });
      const event = normalizeEvent(req.body, existing);
      if (supabase) {
        const { data, error } = await supabase.from('events').update(event).eq('id', req.params.id).select('*').single();
        if (error) throw error;
        return res.json(data);
      }
      const set = Object.keys(event).map(k => `${k}=@${k}`).join(',');
      db.prepare(`update events set ${set}, updated_at=datetime('now') where id=@id`).run({ ...event, id: req.params.id });
      res.json(db.prepare('select * from events where id=?').get(req.params.id));
    } catch (error) { res.status(400).json({ error: error.message || 'Unable to update event.' }); }
  });

  app.delete('/api/admin/events/:id', adminOnly, async (req, res) => {
    try {
      if (supabase) {
        const { error } = await supabase.from('events').delete().eq('id', req.params.id);
        if (error) throw error;
      } else db.prepare('delete from events where id=?').run(req.params.id);
      res.json({ ok: true });
    } catch (_) { res.status(500).json({ error: 'Unable to delete event.' }); }
  });
}
