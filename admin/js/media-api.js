/* Media API module */
export async function listMedia(api) {
  const response = await api('/api/media');
  if (!response.ok) throw new Error('Unable to load media.');
  return response.json();
}

export async function uploadMedia(api, form) {
  return api('/api/media', { method: 'POST', body: new FormData(form) });
}

export async function deleteMedia(api, id) {
  return api(`/api/media/${id}`, { method: 'DELETE' });
}
