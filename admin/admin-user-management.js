/* Admin user-management UI foundation. The backend endpoints are intentionally consumed only when available. */
(function(){
  'use strict';

  const API = '/api/admin/users';

  async function request(path='', options={}) {
    const response = await fetch(API + path, {
      credentials: 'include',
      headers: {'Content-Type':'application/json', ...(options.headers || {})},
      ...options
    });
    let payload = null;
    try { payload = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(payload?.error || 'Unable to complete the administrator request.');
    return payload;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function render(container, users) {
    container.innerHTML = `
      <section class="admin-users-card">
        <div class="admin-users-heading">
          <div><h2>Admin Users</h2><p>Manage administrator accounts, roles and access.</p></div>
          <button type="button" class="admin-users-create">+ Create User</button>
        </div>
        <div class="admin-users-list">
          ${users.length ? users.map(user => `
            <article class="admin-user-row" data-user-id="${escapeHtml(user.id)}">
              <div><strong>${escapeHtml(user.username)}</strong><span>${escapeHtml(user.role)}</span></div>
              <div><span class="admin-user-status ${user.is_active ? 'active':'disabled'}">${user.is_active ? 'Active':'Disabled'}</span><button type="button" data-edit-user="${escapeHtml(user.id)}">Edit</button></div>
            </article>`).join('') : '<p>No administrator accounts found.</p>'}
        </div>
      </section>`;

    container.querySelector('.admin-users-create')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('admin:create-user')));
    container.querySelectorAll('[data-edit-user]').forEach(button => button.addEventListener('click', () => {
      const user = users.find(item => String(item.id) === String(button.dataset.editUser));
      window.dispatchEvent(new CustomEvent('admin:edit-user', {detail:user}));
    }));
  }

  async function mount(container) {
    if (!container) return;
    try {
      const result = await request();
      render(container, Array.isArray(result) ? result : (result.users || []));
    } catch (error) {
      container.innerHTML = `<section class="admin-users-card"><h2>Admin Users</h2><p class="admin-users-error">${escapeHtml(error.message)}</p></section>`;
    }
  }

  window.AdminUserManagement = Object.freeze({ mount, request });
})();
