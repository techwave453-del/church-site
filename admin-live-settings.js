/* Friendly admin editor + Live comment moderation. */
(function () {
  const $ = (id) => document.getElementById(id);
  const api = (url, opt = {}) => fetch(url, { credentials: 'include', ...opt });
  const editors = [
    { id: 'services', title: 'Service Times', empty: { title: '', time: '', image: '' }, fields: [['title', 'Service name', 'text'], ['time', 'Time', 'text'], ['image', 'Image URL', 'url']] },
    { id: 'links', title: 'Homepage Links', empty: { title: '', description: '', url: '', image: '' }, fields: [['title', 'Card title', 'text'], ['description', 'Short description', 'textarea'], ['url', 'Link / page URL', 'url'], ['image', 'Image URL', 'url']] },
    { id: 'membershipClasses', title: 'Membership Classes', empty: { title: '', description: '', image: '', registrationUrl: '' }, fields: [['title', 'Class name', 'text'], ['description', 'Description', 'textarea'], ['image', 'Image URL', 'url'], ['registrationUrl', 'Registration link', 'url']] },
    { id: 'gallery', title: 'Gallery', empty: { title: '', url: '', category: '' }, fields: [['title', 'Photo title', 'text'], ['url', 'Image URL', 'url'], ['category', 'Category', 'text']] }
  ];
  let ready = false;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const parse = id => { try { const v = JSON.parse($(id).value || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } };

  function makeFriendlyEditor(cfg) {
    const ta = $(cfg.id); if (!ta || ta.dataset.friendly === '1') return;
    ta.dataset.friendly = '1'; ta.classList.add('hidden');
    const box = document.createElement('div'); box.id = cfg.id + 'Friendly'; box.className = 'friendlyEditor';
    box.innerHTML = `<div class="friendlyItems"></div><button type="button" class="secondary small addFriendly">+ Add ${esc(cfg.title.replace(/s$/, ''))}</button>`;
    ta.parentElement.appendChild(box);
    box.querySelector('.addFriendly').addEventListener('click', () => { const items = parse(cfg.id); items.push({ ...cfg.empty }); write(cfg.id, items); render(cfg); }); render(cfg);
  }
  function render(cfg) {
    const box = $(cfg.id + 'Friendly'); if (!box) return; const list = box.querySelector('.friendlyItems'); const items = parse(cfg.id);
    if (!items.length) { list.innerHTML = `<div class="friendlyEmpty">No ${esc(cfg.title.toLowerCase())} added yet. Use the button below to add one.</div>`; return; }
    list.innerHTML = items.map((item, i) => `<div class="friendlyItem" data-i="${i}"><div class="friendlyHead"><strong>${esc(item.title || cfg.title.replace(/s$/, '') + ' ' + (i + 1))}</strong><button type="button" class="danger small removeFriendly">Remove</button></div><div class="friendlyGrid">${cfg.fields.map(([key,label,type]) => `<div class="friendlyField"><label>${esc(label)}</label>${type === 'textarea' ? `<textarea data-key="${esc(key)}" placeholder="${esc(label)}">${esc(item[key] || '')}</textarea>` : `<input data-key="${esc(key)}" type="${type === 'url' ? 'url' : 'text'}" value="${esc(item[key] || '')}" placeholder="${esc(label)}">`}</div>`).join('')}</div></div>`).join('');
    list.querySelectorAll('.friendlyItem').forEach(row => { const i = Number(row.dataset.i); row.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { const a = parse(cfg.id); a[i][input.dataset.key] = input.value; write(cfg.id, a); const h = row.querySelector('.friendlyHead strong'); h.textContent = a[i].title || cfg.title.replace(/s$/, '') + ' ' + (i + 1); })); row.querySelector('.removeFriendly').addEventListener('click', () => { const a = parse(cfg.id); a.splice(i, 1); write(cfg.id, a); render(cfg); }); });
  }
  function write(id, value) { $(id).value = JSON.stringify(value); }
  function addStyles() {
    if ($('friendlyAdminStyles')) return; const s = document.createElement('style'); s.id = 'friendlyAdminStyles';
    s.textContent = `.friendlyEditor{margin-top:10px}.friendlyItems{display:grid;gap:12px}.friendlyItem{border:1px solid #dfe4e8;border-radius:12px;padding:13px;background:#fafbfc}.friendlyHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.friendlyGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:4px 12px}.friendlyField label{font-size:13px;margin-top:7px}.friendlyField textarea{min-height:76px}.friendlyEmpty{padding:18px;text-align:center;border:1px dashed #cbd3da;border-radius:10px;color:#66717d;background:#fafbfc}.friendlyEditor .addFriendly{margin-top:10px}.liveComment{border-top:1px solid #eee;padding:14px 0}.liveComment:first-child{border-top:0}.liveCommentHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.liveCommentMeta{color:#66717d;font-size:12px}.liveCommentText{margin:8px 0;white-space:pre-wrap;overflow-wrap:anywhere}.commentStatus{display:inline-block;padding:3px 8px;border-radius:99px;font-size:11px;font-weight:700}.commentStatus.approved{background:#e8f5e9;color:#18794e}.commentStatus.hiddenStatus{background:#fff3cd;color:#7a5b00}@media(max-width:650px){.friendlyGrid{grid-template-columns:1fr}.liveCommentHead{flex-direction:column}}`;
    document.head.appendChild(s);
  }
  function install() {
    if (ready || !$('services')) return false; ready = true; addStyles(); editors.forEach(makeFriendlyEditor);
    editors.forEach(cfg => { const ta = $(cfg.id); const section = ta && ta.closest('.section'); if (section) { const p = section.querySelector('.head p'); if (p) p.textContent = `Add, edit or remove ${cfg.title.toLowerCase()} using simple forms.`; } });
    const gallery = $('gallery'); if (gallery) { const section = gallery.closest('.section'); if (section) section.querySelectorAll('label').forEach(l => { if (l.textContent.includes('Gallery')) l.classList.add('hidden'); }); }
    wrapLoad(); wrapSave(); installCommentModeration(); return true;
  }
  function wrapLoad() { if (typeof window.load !== 'function' || window.load.__friendlyWrapped) return; const original = window.load; const wrapped = async function () { const r = await original.apply(this, arguments); editors.forEach(render); await loadLiveComments(); return r; }; wrapped.__friendlyWrapped = true; window.load = wrapped; }
  function wrapSave() { if (typeof window.save !== 'function' || window.save.__friendlyWrapped) return; const original = window.save; const wrapped = async function () { editors.forEach(cfg => { const box = $(cfg.id + 'Friendly'); if (box) { const a = parse(cfg.id); box.querySelectorAll('.friendlyItem').forEach(row => { const i = Number(row.dataset.i); row.querySelectorAll('[data-key]').forEach(input => { a[i][input.dataset.key] = input.value; }); }); write(cfg.id, a); } }); return original.apply(this, arguments); }; wrapped.__friendlyWrapped = true; window.save = wrapped; }
  async function loadLive() { if (!$('liveEnabled')) return; try { const r = await api('/api/site/content'); if (!r.ok) return; const live = (await r.json()).liveStream || {}; $('liveEnabled').value = live.enabled ? 'true' : 'false'; if ($('liveTitle')) $('liveTitle').value = live.title || ''; if ($('liveUrl')) $('liveUrl').value = live.url || live.videoUrl || ''; if ($('liveDescription')) $('liveDescription').value = live.description || ''; } catch (_) {} }

  function installCommentModeration() {
    if ($('liveCommentsAdmin')) return;
    const tabs = document.querySelector('.tabs'); const site = $('site'); if (!tabs || !site) return;
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Live Comments'; button.addEventListener('click', () => showCommentsTab(button)); tabs.appendChild(button);
    const section = document.createElement('section'); section.id = 'liveCommentsAdmin'; section.className = 'hidden'; section.innerHTML = `<div class="card"><div class="head"><div><h2>Live Comments</h2><p>Review comments posted during the live stream. Hide or delete anything inappropriate.</p></div><button class="secondary small" type="button" id="refreshLiveComments">Refresh</button></div><div id="liveCommentsList"><div class="empty">Loading comments…</div></div></div>`;
    site.parentElement.appendChild(section); $('refreshLiveComments').addEventListener('click', loadLiveComments);
  }
  function showCommentsTab(button) { document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('active')); button.classList.add('active'); $('site').classList.add('hidden'); $('media').classList.add('hidden'); $('liveCommentsAdmin').classList.remove('hidden'); loadLiveComments(); }
  async function loadLiveComments() {
    const box = $('liveCommentsList'); if (!box) return; box.innerHTML = '<div class="empty">Loading comments…</div>';
    try { const r = await api('/api/admin/live/comments'); if (!r.ok) throw new Error((await r.json()).error || 'Unable to load comments.'); const items = await r.json();
      if (!items.length) { box.innerHTML = '<div class="empty">No live comments yet.</div>'; return; }
      box.innerHTML = items.map(item => `<article class="liveComment"><div class="liveCommentHead"><div><strong>${esc(item.name)}</strong><div class="liveCommentMeta">${esc(new Date(item.created_at).toLocaleString())} · <span class="commentStatus ${item.approved ? 'approved' : 'hiddenStatus'}">${item.approved ? 'Visible' : 'Hidden'}</span></div></div><div class="toolbar" style="margin-top:0"><button class="secondary small" type="button" data-action="toggle" data-id="${Number(item.id)}">${item.approved ? 'Hide' : 'Approve'}</button><button class="danger small" type="button" data-action="delete" data-id="${Number(item.id)}">Delete</button></div></div><div class="liveCommentText">${esc(item.comment)}</div></article>`).join('');
      box.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => moderateComment(btn.dataset.action, Number(btn.dataset.id), btn)));
    } catch (e) { box.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  }
  async function moderateComment(action, id, btn) {
    if (action === 'delete' && !confirm('Delete this comment permanently?')) return;
    btn.disabled = true;
    try { const r = action === 'delete' ? await api('/api/admin/live/comments/' + id, { method: 'DELETE' }) : await api('/api/admin/live/comments/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: btn.textContent.trim() === 'Approve' }) }); if (!r.ok) throw new Error((await r.json()).error || 'Action failed.'); await loadLiveComments(); } catch (e) { alert(e.message); btn.disabled = false; }
  }
  async function loadLiveCommentsAfterBoot() { try { await loadLiveComments(); } catch (_) {} }
  function boot() { if (install()) return; const timer = setInterval(() => { if (install()) clearInterval(timer); }, 100); setTimeout(() => clearInterval(timer), 10000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { boot(); loadLive(); }, { once: true }); else { boot(); loadLive(); }
})();