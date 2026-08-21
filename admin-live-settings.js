/* Compatibility loader for the redesigned admin Live Streaming section. */
(function () {
  const $ = (id) => document.getElementById(id);
  const api = (url, opt = {}) => fetch(url, { credentials: 'include', ...opt });
  async function load() {
    if (!$('liveEnabled')) return;
    try {
      const r = await api('/api/site/content');
      if (!r.ok) return;
      const live = (await r.json()).liveStream || {};
      $('liveEnabled').value = live.enabled ? 'true' : 'false';
      if ($('liveTitle')) $('liveTitle').value = live.title || '';
      if ($('liveUrl')) $('liveUrl').value = live.url || live.videoUrl || '';
      if ($('liveDescription')) $('liveDescription').value = live.description || '';
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();