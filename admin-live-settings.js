/* Friendly admin editor: keeps JSON as an internal storage format, never as a user-facing editing task. */
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
    const ta = $(cfg.id);
    if (!ta || ta.dataset.friendly === '1') return;
    ta.dataset.friendly = '1';
    ta.classList.add('hidden');
    const box = document.createElement('div');
    box.id = cfg.id + 'Friendly';
    box.className = 'friendlyEditor';
    box.innerHTML = `<div class="friendlyItems"></div><button type="button" class="secondary small addFriendly">+ Add ${esc(cfg.title.replace(/s$/, ''))}</button>`;
    ta.parentElement.appendChild(box);
    box.querySelector('.addFriendly').addEventListener('click', () => { const items = parse(id); items.push({ ...cfg.empty }); write(cfg.id, items); render(cfg); });
    render(cfg);
  }

  function render(cfg) {
    const box = $(cfg.id + 'Friendly'); if (!box) return;
    const list = box.querySelector('.friendlyItems'); const items = parse(cfg.id);
    if (!items.length) { list.innerHTML = `<div class="friendlyEmpty">No ${esc(cfg.title.toLowerCase())} added yet. Use the button below to add one.</div>`; return; }
    list.innerHTML = items.map((item, i) => `<div class="friendlyItem" data-i="${i}"><div class="friendlyHead"><strong>${esc(item.title || cfg.title.replace(/s$/, '') + ' ' + (i + 1))}</strong><button type="button" class="danger small removeFriendly">Remove</button></div><div class="friendlyGrid">${cfg.fields.map(([key,label,type]) => `<div class="friendlyField"><label>${esc(label)}</label>${type === 'textarea' ? `<textarea data-key="${esc(key)}" placeholder="${esc(label)}">${esc(item[key] || '')}</textarea>` : `<input data-key="${esc(key)}" type="${type === 'url' ? 'url' : 'text'}" value="${esc(item[key] || '')}" placeholder="${esc(label)}">`}</div>`).join('')}</div></div>`).join('');
    list.querySelectorAll('.friendlyItem').forEach(row => {
      const i = Number(row.dataset.i);
      row.querySelectorAll('[data-key]').forEach(input => input.addEventListener('input', () => { const a = parse(cfg.id); a[i][input.dataset.key] = input.value; $(cfg.id).value = JSON.stringify(a); const h = row.querySelector('.friendlyHead strong'); h.textContent = a[i].title || cfg.title.replace(/s$/, '') + ' ' + (i + 1); }));
      row.querySelector('.removeFriendly').addEventListener('click', () => { const a = parse(cfg.id); a.splice(i, 1); write(cfg.id, a); render(cfg); });
    });
  }
  function write(id, value) { $(id).value = JSON.stringify(value); }

  function addStyles() {
    if ($('friendlyAdminStyles')) return;
    const s = document.createElement('style'); s.id = 'friendlyAdminStyles';
    s.textContent = `.friendlyEditor{margin-top:10px}.friendlyItems{display:grid;gap:12px}.friendlyItem{border:1px solid #dfe4e8;border-radius:12px;padding:13px;background:#fafbfc}.friendlyHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.friendlyGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:4px 12px}.friendlyField label{font-size:13px;margin-top:7px}.friendlyField textarea{min-height:76px}.friendlyEmpty{padding:18px;text-align:center;border:1px dashed #cbd3da;border-radius:10px;color:#66717d;background:#fafbfc}.friendlyEditor .addFriendly{margin-top:10px}@media(max-width:650px){.friendlyGrid{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }

  function install() {
    if (ready || !$('services')) return false;
    ready = true; addStyles(); editors.forEach(makeFriendlyEditor);
    // Replace technical copy with plain-language guidance.
    editors.forEach(cfg => { const ta = $(cfg.id); const section = ta && ta.closest('.section'); if (section) { const p = section.querySelector('.head p'); if (p) p.textContent = `Add, edit or remove ${cfg.title.toLowerCase()} using simple forms.`; } });
    const gallery = $('gallery'); if (gallery) { const section = gallery.closest('.section'); if (section) { const labels = section.querySelectorAll('label'); labels.forEach(l => { if (l.textContent.includes('Gallery')) l.classList.add('hidden'); }); } }
    wrapLoad(); wrapSave();
    return true;
  }
  function wrapLoad() {
    if (typeof window.load !== 'function' || window.load.__friendlyWrapped) return;
    const original = window.load; const wrapped = async function () { const r = await original.apply(this, arguments); editors.forEach(render); return r; }; wrapped.__friendlyWrapped = true; window.load = wrapped;
  }
  function wrapSave() {
    if (typeof window.save !== 'function' || window.save.__friendlyWrapped) return;
    const original = window.save; const wrapped = async function () { editors.forEach(cfg => { const box = $(cfg.id + 'Friendly'); if (box) { const a = parse(cfg.id); box.querySelectorAll('.friendlyItem').forEach(row => { const i = Number(row.dataset.i); row.querySelectorAll('[data-key]').forEach(input => { a[i][input.dataset.key] = input.value; }); }); write(cfg.id, a); } }); return original.apply(this, arguments); }; wrapped.__friendlyWrapped = true; window.save = wrapped;
  }
  async function loadLive() {
    if (!$('liveEnabled')) return;
    try { const r = await api('/api/site/content'); if (!r.ok) return; const live = (await r.json()).liveStream || {}; $('liveEnabled').value = live.enabled ? 'true' : 'false'; if ($('liveTitle')) $('liveTitle').value = live.title || ''; if ($('liveUrl')) $('liveUrl').value = live.url || live.videoUrl || ''; if ($('liveDescription')) $('liveDescription').value = live.description || ''; } catch (_) {}
  }
  function boot() {
    if (install()) return;
    const timer = setInterval(() => { if (install()) clearInterval(timer); }, 100);
    setTimeout(() => clearInterval(timer), 10000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { boot(); loadLive(); }, { once: true }); else { boot(); loadLive(); }
})();