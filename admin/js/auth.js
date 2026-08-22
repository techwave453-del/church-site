/* Admin authentication + modular bootstrap */
export async function api(url, options = {}) {
  return fetch(url, { credentials: 'include', ...options });
}

export async function checkApiStatus(statusEl) {
  try {
    const response = await api('/api/health');
    const data = await response.json();
    statusEl.textContent = response.ok ? `API · ${data.database || 'online'}` : 'API error';
    statusEl.className = `status ${response.ok ? 'ok' : 'bad'}`;
    return response.ok;
  } catch {
    statusEl.textContent = 'API offline';
    statusEl.className = 'status bad';
    return false;
  }
}

export async function login(username, password) {
  return api('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) });
}
export async function logout() { return api('/api/admin/logout', { method: 'POST' }); }
export async function getSession() { return api('/api/admin/session'); }

import { textKeys, schemas, createEmptyData, renderEditor, addItem as addContentItem, removeItem as removeContentItem } from './site-content.js';
import { copyMediaUrl } from './media-library.js';
import { listMedia, uploadMedia, deleteMedia } from './media-api.js';
import { loadComments as renderComments, moderateComment, deleteComment as removeComment } from './live-comments.js';
import { readLiveSettings, writeLiveSettings, validateLiveSettings } from './live-stream.js';

const $ = id => document.getElementById(id);
let data = createEmptyData();

function msg(text, error = false) {
  $('notice').textContent = text;
  $('notice').className = 'notice show' + (error ? ' error' : '');
  setTimeout(() => $('notice').className = 'notice', 4500);
}
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }

function render(key) {
  renderEditor(document, key, data, esc);
  const box = $(key === 'membershipClasses' ? 'classesEditor' : `${key}Editor`);
  if (!box) return;
  box.querySelectorAll('[data-key]').forEach(el => el.addEventListener('input', () => {
    data[el.dataset.key][Number(el.dataset.index)][el.dataset.field] = el.value;
    renderHeader(el.dataset.key, Number(el.dataset.index));
  }));
  box.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => removeItem(btn.dataset.remove, Number(btn.dataset.index))));
}
function renderHeader(key, index) {
  const box = $(key === 'membershipClasses' ? 'classesEditor' : `${key}Editor`);
  const row = box?.querySelectorAll('.editor-item')[index];
  if (row) row.querySelector('strong').textContent = data[key][index].title || `${schemas[key].title} ${index + 1}`;
}
function addItem(key) { addContentItem(data, key); render(key); $(key === 'membershipClasses' ? 'classesEditor' : `${key}Editor`)?.lastElementChild?.scrollIntoView({ behavior:'smooth', block:'center' }); }
function removeItem(key, index) { if (!confirm('Remove this item?')) return; removeContentItem(data, key, index); render(key); }

async function load() {
  try {
    $('saveState').textContent = 'Loading…';
    const response = await api('/api/site/content');
    if (!response.ok) throw new Error((await response.json()).error || 'Could not load site content.');
    const content = await response.json();
    textKeys.forEach(key => { $(key).value = content[key] ?? ''; });
    data.services = Array.isArray(content.services) ? content.services : [];
    data.links = Array.isArray(content.links) ? content.links : [];
    data.membershipClasses = Array.isArray(content.membershipClasses) ? content.membershipClasses : [];
    data.gallery = Array.isArray(content.gallery) ? content.gallery : [];
    Object.keys(data).forEach(render);
    writeLiveSettings(document, content.liveStream || {});
    $('saveState').textContent = 'All changes loaded.';
    await loadMedia();
  } catch (error) { msg(error.message, true); $('saveState').textContent = 'Load failed.'; }
}

async function save() {
  try {
    $('saveState').textContent = 'Saving…';
    const payload = {};
    textKeys.forEach(key => { payload[key] = $(key).value.trim(); });
    payload.services = data.services; payload.links = data.links; payload.membershipClasses = data.membershipClasses; payload.gallery = data.gallery;
    payload.liveStream = readLiveSettings(document); validateLiveSettings(payload.liveStream);
    const response = await api('/api/site/content', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    if (!response.ok) throw new Error((await response.json()).error || 'Save failed.');
    $('saveState').textContent = 'Saved just now.'; msg('Site content saved successfully.');
  } catch (error) { $('saveState').textContent = 'Save failed.'; msg(error.message, true); }
}

async function upload(event) {
  event.preventDefault();
  try {
    const response = await uploadMedia(api, event.target);
    if (!response.ok) { msg((await response.json()).error || 'Upload failed.', true); return; }
    event.target.reset(); msg('Media uploaded successfully.'); await loadMedia();
  } catch (error) { msg(error.message || 'Upload failed.', true); }
}

async function loadMedia() {
  const box = $('mediaList'); box.textContent = 'Loading…';
  try {
    const items = await listMedia(api);
    box.innerHTML = items.length ? items.map(item => `<div class="media">${item.type === 'image' ? `<img class="thumb" src="${esc(item.url)}" alt="">` : '<div class="thumb"></div>'}<div class="mi"><strong>${esc(item.title)}</strong><small>${esc(item.category)} · ${esc(item.type)}</small></div><div class="toolbar"><button type="button" class="secondary small" data-copy-url="${esc(item.url)}">Copy URL</button><a class="secondary small" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a><button type="button" class="danger small" data-delete-media="${Number(item.id)}">Delete</button></div></div>`).join('') : '<div class="empty">No media uploaded yet.</div>';
    box.querySelectorAll('[data-copy-url]').forEach(button => button.addEventListener('click', async () => { if (!await copyMediaUrl(button.dataset.copyUrl, button)) msg('Could not copy the URL. Please try again.', true); }));
    box.querySelectorAll('[data-delete-media]').forEach(button => button.addEventListener('click', () => delMedia(Number(button.dataset.deleteMedia))));
  } catch (error) { box.innerHTML = `<div class="empty">${esc(error.message || 'Unable to load media.')}</div>`; }
}
async function delMedia(id) { if (!confirm('Delete this media item?')) return; try { const response = await deleteMedia(api, id); if (response.ok) { msg('Media deleted.'); await loadMedia(); } else msg((await response.json()).error || 'Delete failed.', true); } catch (error) { msg(error.message || 'Delete failed.', true); } }

async function loadComments() {
  await renderComments(api, $('commentsList'), esc);
  $('commentsList').querySelectorAll('[data-moderate]').forEach(button => button.addEventListener('click', async () => { const response = await moderateComment(api, Number(button.dataset.moderate), button.dataset.approved === 'true'); if (!response.ok) { msg((await response.json()).error || 'Action failed.', true); return; } await loadComments(); }));
  $('commentsList').querySelectorAll('[data-delete-comment]').forEach(button => button.addEventListener('click', async () => { if (!confirm('Delete this comment permanently?')) return; const response = await removeComment(api, Number(button.dataset.deleteComment)); if (!response.ok) { msg((await response.json()).error || 'Delete failed.', true); return; } await loadComments(); }));
}
function tab(which, button) { document.querySelectorAll('.tabs button').forEach(item => item.classList.remove('active')); button.classList.add('active'); ['site','media','comments'].forEach(id => $(id).classList.toggle('hidden', id !== which)); if (which === 'media') loadMedia(); if (which === 'comments') loadComments(); }
async function loginForm(event) { event.preventDefault(); try { const response = await login($('username').value, $('password').value); if (response.ok) { $('login').classList.add('hidden'); $('app').classList.remove('hidden'); msg('Signed in successfully.'); await load(); } else $('loginMsg').textContent = (await response.json()).error || 'Invalid username or password.'; } catch (error) { $('loginMsg').textContent = error.message || 'Unable to sign in. Please try again.'; } }

Object.assign(window, { api, login: loginForm, logout, tab, load, save, upload, loadMedia, loadComments, addItem });

async function init() {
  await checkApiStatus($('apiStatus'));
  try {
    const session = await getSession();
    if (session.ok) {
      $('login').classList.add('hidden');
      $('app').classList.remove('hidden');
      await load();
    }
  } catch (error) {
    msg('Unable to connect to the admin session. Please refresh and try again.', true);
  }
}
init();
