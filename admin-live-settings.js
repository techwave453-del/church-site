/* Adds Live Stream settings to the existing admin dashboard. */
(function () {
  const $ = (id) => document.getElementById(id);
  const api = (url, opt = {}) => fetch(url, { credentials: 'include', ...opt });

  function addPanel() {
    if (!$('site') || $('liveStreamSettings')) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'liveStreamSettings';
    card.innerHTML = `
      <h2>Live Streaming</h2>
      <p><small>Control the floating LIVE button on the public website from here.</small></p>
      <div class="grid">
        <div><label>Enable Live Button</label><select id="liveEnabled"><option value="false">Disabled</option><option value="true">Enabled</option></select></div>
        <div><label>Live Stream Title</label><input id="liveTitle" placeholder="Live Worship Service"></div>
        <div><label>YouTube Live URL</label><input id="liveUrl" placeholder="https://www.youtube.com/watch?v=..."></div>
        <div><label>Description</label><input id="liveDescription" placeholder="Join us live for worship, the Word of God and fellowship."></div>
      </div>
      <button type="button" id="saveLiveSettings">Save Live Settings</button>
    `;
    const mediaCard = Array.from(document.querySelectorAll('#site .card')).find(x => x.textContent.includes('Media / Hero'));
    (mediaCard || $('site')).insertAdjacentElement('afterend', card);

    $('saveLiveSettings').onclick = async () => {
      try {
        const r = await api('/api/site/content');
        if (!r.ok) throw new Error('Could not load current site content.');
        const current = await r.json();
        const data = {
          ...current,
          liveStream: {
            ...(current.liveStream || {}),
            enabled: $('liveEnabled').value === 'true',
            title: $('liveTitle').value.trim(),
            url: $('liveUrl').value.trim(),
            description: $('liveDescription').value.trim()
          }
        };
        const save = await api('/api/site/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!save.ok) throw new Error((await save.json()).error || 'Save failed.');
        const notice = $('notice');
        notice.className = 'notice';
        notice.textContent = 'Live streaming settings saved successfully.';
      } catch (e) {
        const notice = $('notice');
        notice.className = 'notice error';
        notice.textContent = e.message;
      }
    };

    loadPanel();
  }

  async function loadPanel() {
    try {
      const r = await api('/api/site/content');
      if (!r.ok) return;
      const live = (await r.json()).liveStream || {};
      if ($('liveEnabled')) $('liveEnabled').value = live.enabled ? 'true' : 'false';
      if ($('liveTitle')) $('liveTitle').value = live.title || '';
      if ($('liveUrl')) $('liveUrl').value = live.url || live.videoUrl || '';
      if ($('liveDescription')) $('liveDescription').value = live.description || '';
    } catch (_) {}
  }

  function start() {
    if ($('app') && !$('app').classList.contains('hidden')) addPanel();
    const observer = new MutationObserver(() => {
      if ($('app') && !$('app').classList.contains('hidden')) {
        addPanel();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
