/* Live stream settings module */
export function readLiveSettings(document) {
  return {
    enabled: document.getElementById('liveEnabled').value === 'true',
    title: document.getElementById('liveTitle').value.trim(),
    url: document.getElementById('liveUrl').value.trim(),
    description: document.getElementById('liveDescription').value.trim()
  };
}

export function writeLiveSettings(document, live = {}) {
  document.getElementById('liveEnabled').value = live.enabled ? 'true' : 'false';
  document.getElementById('liveTitle').value = live.title || '';
  document.getElementById('liveUrl').value = live.url || live.videoUrl || '';
  document.getElementById('liveDescription').value = live.description || '';
}

export function validateLiveSettings(live) {
  if (live.enabled && !live.url) {
    throw new Error('Add a YouTube Live URL or disable the Live Button.');
  }
  return true;
}
