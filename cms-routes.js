const SECTION_TYPES = new Set(['hero','text','image_text','gallery','cards','events','services','video','youtube','live','contact','cta','giving','custom']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function cleanPage(input = {}) {
  const slug = String(input.slug || '').trim().toLowerCase();
  const internalName = String(input.internal_name ?? input.internalName ?? '').trim().slice(0, 160);
  const menuLabel = String(input.menu_label ?? input.menuLabel ?? internalName).trim().slice(0, 80);
  const status = ['draft', 'published', 'archived'].includes(input.status) ? input.status : 'draft';
  if (!internalName || !slugPattern.test(slug)) throw new Error('Use a page name and a URL slug containing lowercase letters, numbers, and hyphens.');
  return { slug, internal_name: internalName, menu_label: menuLabel || internalName, status, show_in_navigation: Boolean(input.show_in_navigation ?? input.showInNavigation) };
}
function cleanSection(input = {}, position = 0) {
  const sectionType = String(input.section_type ?? input.sectionType ?? 'text');
  if (!SECTION_TYPES.has(sectionType)) throw new Error('Unsupported page section type.');
  const content = input.content && typeof input.content === 'object' && !Array.isArray(input.content) ? input.content : {};
  if (JSON.stringify(content).length > 20000) throw new Error('Section content is too large.');
  return { section_type: sectionType, position, content };
}
function cleanNavigation(input = {}) {
  const label = String(input.label || '').trim().slice(0, 80);
  const href = String(input.href || '').trim().slice(0, 300);
  if (!label || !href || (!href.startsWith('/') && !href.startsWith('#') && !/^https?:\/\//i.test(href))) throw new Error('Navigation items need a label and a safe URL.');
  return { label, href, parent_id: input.parent_id ? Number(input.parent_id) : null, parent_index: Number.isInteger(input.parent_index) ? input.parent_index : null, position: Math.max(0, Number(input.position) || 0), is_visible: input.is_visible !== false };
}

export function registerAdminCmsRoutes({ app, supabase, sqlite, requireAdmin, requireSameOrigin, requirePermission }) {
  const useSupabase = Boolean(supabase);
  const permission = (name) => requirePermission ? requirePermission(name) : requireAdmin;
  const requirePublishIfNeeded = (req, res, next) => req.body?.status === 'published' ? permission('site.publish')(req, res, next) : next();
  async function listPages(includeUnpublished) {
    if (useSupabase) {
      let query = supabase.from('cms_pages').select('*,cms_sections(*)').order('updated_at', { ascending: false });
      if (!includeUnpublished) query = query.eq('status', 'published');
      const { data, error } = await query; if (error) throw error;
      return (data || []).map(page => ({ ...page, sections: (page.cms_sections || []).sort((a, b) => a.position - b.position) }));
    }
    const pages = sqlite.prepare(`SELECT * FROM cms_pages ${includeUnpublished ? '' : "WHERE status='published'"} ORDER BY updated_at DESC`).all();
    const sections = sqlite.prepare('SELECT * FROM cms_sections ORDER BY position').all();
    return pages.map(page => ({ ...page, show_in_navigation: Boolean(page.show_in_navigation), sections: sections.filter(section => section.page_id === page.id).map(section => ({ ...section, content: JSON.parse(section.content || '{}') })) }));
  }
  async function savePage(input, id = null) {
    const page = cleanPage(input); const sections = Array.isArray(input.sections) ? input.sections.map(cleanSection) : [];
    if (useSupabase) {
      const saved = id ? await supabase.from('cms_pages').update(page).eq('id', id).select('*').single() : await supabase.from('cms_pages').insert(page).select('*').single();
      if (saved.error) throw saved.error;
      await supabase.from('cms_sections').delete().eq('page_id', saved.data.id);
      if (sections.length) { const result = await supabase.from('cms_sections').insert(sections.map(section => ({ ...section, page_id: saved.data.id }))); if (result.error) throw result.error; }
      return (await listPages(true)).find(item => String(item.id) === String(saved.data.id));
    }
    const now = new Date().toISOString();
    let pageId = id;
    if (id) sqlite.prepare('UPDATE cms_pages SET slug=?,internal_name=?,menu_label=?,status=?,show_in_navigation=?,updated_at=? WHERE id=?').run(page.slug, page.internal_name, page.menu_label, page.status, page.show_in_navigation ? 1 : 0, now, id);
    else pageId = sqlite.prepare('INSERT INTO cms_pages (slug,internal_name,menu_label,status,show_in_navigation,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(page.slug, page.internal_name, page.menu_label, page.status, page.show_in_navigation ? 1 : 0, now, now).lastInsertRowid;
    sqlite.prepare('DELETE FROM cms_sections WHERE page_id=?').run(pageId);
    const insert = sqlite.prepare('INSERT INTO cms_sections (page_id,section_type,position,content,created_at,updated_at) VALUES (?,?,?,?,?,?)');
    sections.forEach(section => insert.run(pageId, section.section_type, section.position, JSON.stringify(section.content), now, now));
    return (await listPages(true)).find(item => String(item.id) === String(pageId));
  }
  async function listNavigation() {
    if (useSupabase) { const { data, error } = await supabase.from('cms_navigation').select('*').eq('is_visible', true).order('position'); if (error) throw error; return data || []; }
    return sqlite.prepare('SELECT id,label,href,parent_id,position,is_visible,page_id FROM cms_navigation WHERE is_visible=1 ORDER BY position').all();
  }
  app.get('/api/cms/navigation', async (_req, res) => { try { res.json(await listNavigation()); } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load navigation.' }); } });
  app.get('/api/cms/pages', requireAdmin, permission('pages.view'), async (_req, res) => { try { res.json(await listPages(true)); } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load pages.' }); } });
  app.get('/api/cms/pages/preview/:id', requireAdmin, permission('pages.view'), async (req, res) => { try { const page = (await listPages(true)).find(item => String(item.id) === String(Number(req.params.id))); if (!page) return res.status(404).json({ error: 'Page not found.' }); res.json(page); } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load page preview.' }); } });
  app.get('/api/cms/pages/:slug', async (req, res) => { try { const page = (await listPages(false)).find(item => item.slug === req.params.slug); if (!page) return res.status(404).json({ error: 'Page not found.' }); res.json(page); } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load page.' }); } });
  app.post('/api/cms/pages', requireSameOrigin, requireAdmin, permission('pages.create'), requirePublishIfNeeded, async (req, res) => { try { res.status(201).json(await savePage(req.body || {})); } catch (error) { res.status(400).json({ error: error.message || 'Unable to create page.' }); } });
  app.put('/api/cms/pages/:id', requireSameOrigin, requireAdmin, permission('pages.edit'), requirePublishIfNeeded, async (req, res) => { try { res.json(await savePage(req.body || {}, Number(req.params.id))); } catch (error) { res.status(400).json({ error: error.message || 'Unable to update page.' }); } });
  app.delete('/api/cms/pages/:id', requireSameOrigin, requireAdmin, permission('pages.delete'), async (req, res) => { try { const id = Number(req.params.id); if (useSupabase) { const result = await supabase.from('cms_pages').delete().eq('id', id); if (result.error) throw result.error; } else sqlite.prepare('DELETE FROM cms_pages WHERE id=?').run(id); res.json({ ok: true }); } catch (error) { res.status(400).json({ error: error.message || 'Unable to delete page.' }); } });
  app.get('/api/cms/admin/navigation', requireAdmin, permission('navigation.edit'), async (_req, res) => { try { res.json(await listNavigation()); } catch (error) { res.status(500).json({ error: 'Unable to load navigation.' }); } });
  app.put('/api/cms/navigation', requireSameOrigin, requireAdmin, permission('navigation.edit'), async (req, res) => { try {
    const items = Array.isArray(req.body) ? req.body.map(cleanNavigation) : [];
    const ordered = [...items].sort((a, b) => (a.parent_index === null ? -1 : 0) - (b.parent_index === null ? -1 : 0));
    if (useSupabase) {
      const removed = await supabase.from('cms_navigation').delete().neq('id', 0); if (removed.error) throw removed.error;
      const ids = new Map();
      for (const item of ordered) { const parentId = item.parent_index === null ? null : ids.get(item.parent_index) || null; const result = await supabase.from('cms_navigation').insert({ label: item.label, href: item.href, parent_id: parentId, position: item.position, is_visible: item.is_visible }).select('id').single(); if (result.error) throw result.error; ids.set(items.indexOf(item), result.data.id); }
    } else {
      sqlite.prepare('DELETE FROM cms_navigation').run(); const ids = new Map();
      const insert = sqlite.prepare('INSERT INTO cms_navigation (label,href,parent_id,position,is_visible,page_id) VALUES (?,?,?,?,?,?)');
      ordered.forEach(item => { const parentId = item.parent_index === null ? null : ids.get(item.parent_index) || null; const result = insert.run(item.label, item.href, parentId, item.position, item.is_visible ? 1 : 0, null); ids.set(items.indexOf(item), result.lastInsertRowid); });
    }
    res.json(await listNavigation());
  } catch (error) { res.status(400).json({ error: error.message || 'Unable to save navigation.' }); } });
}