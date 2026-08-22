/* Live comments moderation module */
export async function loadComments(api, container, escapeHtml) {
  container.innerHTML = '<div class="empty">Loading comments…</div>';
  try {
    const response = await api('/api/admin/live/comments');
    if (!response.ok) throw new Error((await response.json()).error || 'Unable to load comments.');
    const items = await response.json();
    if (!items.length) {
      container.innerHTML = '<div class="empty">No live comments yet.</div>';
      return;
    }
    container.innerHTML = items.map(item => `
      <article class="comment">
        <div class="comment-head">
          <div><strong>${escapeHtml(item.name)}</strong>
            <div class="muted">${escapeHtml(new Date(item.created_at).toLocaleString())} ·
              <span class="badge ${item.approved ? 'visible' : 'hidden-badge'}">${item.approved ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
          <div class="toolbar">
            <button class="secondary small" type="button" data-moderate="${Number(item.id)}" data-approved="${!item.approved}">${item.approved ? 'Hide' : 'Approve'}</button>
            <button class="danger small" type="button" data-delete-comment="${Number(item.id)}">Delete</button>
          </div>
        </div>
        <div style="margin-top:8px;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(item.comment)}</div>
      </article>`).join('');
  } catch (error) {
    container.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

export async function moderateComment(api, id, approved) {
  return api(`/api/admin/live/comments/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });
}

export async function deleteComment(api, id) {
  return api(`/api/admin/live/comments/${id}`, { method: 'DELETE' });
}
