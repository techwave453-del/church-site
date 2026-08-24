/* Admin Users & Permissions module. Loaded by admin.html. */
(function () {
  'use strict';
  const PERMISSIONS = {
    Site: ['site.view','site.edit'],
    Media: ['media.view','media.upload','media.edit','media.delete'],
    Comments: ['comments.view','comments.moderate'],
    Live: ['live.view','live.edit'],
    Theme: ['theme.view','theme.edit'],
    Users: ['users.view','users.create','users.edit','users.disable','users.delete','users.permissions'],
    Audit: ['audit.view']
  };

  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function permissionEditor(selected = []) {
    const chosen = new Set(selected);
    return Object.entries(PERMISSIONS).map(([group, permissions]) => `
      <fieldset class="rbac-group"><legend>${escapeHtml(group)}</legend>
      ${permissions.map(p => `<label class="rbac-permission"><input type="checkbox" data-permission="${p}" ${chosen.has(p) ? 'checked' : ''}> ${p}</label>`).join('')}
      </fieldset>`).join('');
  }

  function collectPermissions(container) {
    return [...container.querySelectorAll('[data-permission]:checked')].map(el => el.dataset.permission);
  }

  async function loadUsers() {
    const list = document.getElementById('adminUsersList');
    if (!list) return;
    list.innerHTML = '<div class="empty">Loading administrators…</div>';
    try {
      const data = await request('/api/admin/users');
      const users = data.users || [];
      list.innerHTML = users.length ? users.map(user => `
        <div class="admin-user-row" data-user-id="${user.id}">
          <div><strong>${escapeHtml(user.username)}</strong><div class="meta">${escapeHtml(user.role)} · ${user.is_active ? 'Active' : 'Disabled'} · Last login: ${user.last_login_at ? escapeHtml(new Date(user.last_login_at).toLocaleString()) : 'Never'}</div></div>
          <div class="toolbar">
            <button type="button" class="secondary small" data-edit-user="${user.id}">Edit</button>
            <button type="button" class="secondary small" data-password-user="${user.id}">Password</button>
            ${user.role === 'super_admin' ? '' : `<button type="button" class="secondary small" data-status-user="${user.id}" data-status="${user.is_active}">${user.is_active ? 'Disable' : 'Enable'}</button><button type="button" class="danger small" data-delete-user="${user.id}">Delete</button>`}
          </div>
        </div>`).join('') : '<div class="empty">No administrators found.</div>';
      list.querySelectorAll('[data-edit-user]').forEach(btn => btn.onclick = () => editUser(Number(btn.dataset.editUser), users));
      list.querySelectorAll('[data-password-user]').forEach(btn => btn.onclick = () => changePassword(Number(btn.dataset.passwordUser)));
      list.querySelectorAll('[data-status-user]').forEach(btn => btn.onclick = () => toggleStatus(Number(btn.dataset.statusUser), btn.dataset.status === 'true'));
      list.querySelectorAll('[data-delete-user]').forEach(btn => btn.onclick = () => deleteUser(Number(btn.dataset.deleteUser)));
    } catch (error) { list.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; }
  }

  async function editUser(id, users) {
    const user = users.find(item => Number(item.id) === id);
    if (!user) return;
    const username = prompt('Username:', user.username);
    if (username === null) return;
    const role = prompt('Role (super_admin or admin):', user.role);
    if (role === null) return;
    try {
      await request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ username, role }) });
      await loadUsers();
      alert('Administrator updated.');
    } catch (error) { alert(error.message); }
  }

  async function changePassword(id) {
    const password = prompt('Enter the new password (minimum 12 characters):');
    if (password === null) return;
    try { await request(`/api/admin/users/${id}/password`, { method: 'POST', body: JSON.stringify({ password }) }); alert('Password changed.'); }
    catch (error) { alert(error.message); }
  }

  async function toggleStatus(id, active) {
    try { await request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active: !active }) }); await loadUsers(); }
    catch (error) { alert(error.message); }
  }

  async function deleteUser(id) {
    if (!confirm('Delete this administrator permanently?')) return;
    try { await request(`/api/admin/users/${id}`, { method: 'DELETE' }); await loadUsers(); }
    catch (error) { alert(error.message); }
  }

  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = { username: form.username.value, password: form.password.value, role: form.role.value };
    try {
      const created = await request('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
      if (created.user?.id) {
        const permissions = collectPermissions(form);
        if (permissions.length) await request(`/api/admin/users/${created.user.id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) });
      }
      form.reset();
      form.querySelectorAll('[data-permission]').forEach(input => { input.checked = false; });
      await loadUsers();
      alert('Administrator created.');
    } catch (error) { alert(error.message); }
  }

  function injectStyles() {
    if (document.getElementById('admin-rbac-styles')) return;
    const style = document.createElement('style'); style.id = 'admin-rbac-styles'; style.textContent = `
      .admin-user-row{display:flex;justify-content:space-between;gap:14px;align-items:center;border-top:1px solid var(--line);padding:14px 0}.admin-user-row:first-child{border-top:0}.rbac-group{border:1px solid var(--line);border-radius:10px;padding:10px;margin:10px 0}.rbac-group legend{font-weight:700;padding:0 5px}.rbac-permission{display:inline-flex!important;font-weight:500!important;margin:5px 12px 5px 0!important;width:auto!important;gap:5px;align-items:center}.rbac-permission input{width:auto}.rbac-account-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.rbac-section{scroll-margin-top:100px}@media(max-width:650px){.admin-user-row{align-items:flex-start;flex-direction:column}.admin-user-row .toolbar{width:100%}.admin-user-row .toolbar button{flex:1}}
    `; document.head.appendChild(style);
  }

  function injectUI() {
    if (document.getElementById('adminRbac')) return;
    const app = document.getElementById('app'); if (!app) return;
    const wrapper = document.createElement('div'); wrapper.id = 'adminRbac'; wrapper.className = 'rbac-section';
    wrapper.innerHTML = `
      <section class="card"><div class="head"><div><h2>My Account</h2><p class="muted">Manage your administrator username and password.</p></div></div>
        <form id="myAccountForm"><div class="rbac-account-grid"><div><label>Username</label><input id="myAccountUsername" name="username" required></div><div><label>New password</label><input name="password" type="password" minlength="12" placeholder="Leave blank to keep current password"></div></div><div class="toolbar" style="margin-top:14px"><button class="primary">Save My Account</button></div></form>
      </section>
      <section class="card"><div class="head"><div><h2>Users & Permissions</h2><p class="muted">Create administrators and control exactly which areas they can manage.</p></div><button type="button" class="secondary small" id="refreshAdminUsers">Refresh</button></div>
        <div id="adminUsersList"><div class="empty">Loading administrators…</div></div>
      </section>
      <section class="card"><div class="head"><div><h2>Add Administrator</h2><p class="muted">Super Admin accounts have unrestricted access. Custom administrators receive only the permissions selected below.</p></div></div>
        <form id="createAdminForm"><div class="rbac-account-grid"><div><label>Username</label><input name="username" required autocomplete="off"></div><div><label>Temporary password</label><input name="password" type="password" minlength="12" required autocomplete="new-password"></div><div><label>Role</label><select name="role"><option value="admin">Administrator</option><option value="super_admin">Super Admin</option></select></div></div><div class="rbac-permissions"><h3>Permissions</h3>${permissionEditor()}</div><button class="primary" style="margin-top:10px">Create Administrator</button></form>
      </section>`;
    app.appendChild(wrapper);
    document.getElementById('createAdminForm').onsubmit = createUser;
    document.getElementById('refreshAdminUsers').onclick = loadUsers;
    document.getElementById('myAccountForm').onsubmit = async event => {
      event.preventDefault(); const form = event.currentTarget;
      try { await request('/api/admin/me', { method:'PATCH', body:JSON.stringify({username:form.username.value,password:form.password.value || undefined}) }); alert('Account updated. Please sign in again if your username changed.'); } catch (error) { alert(error.message); }
    };
  }

  async function init() {
    injectStyles(); injectUI();
    try { const me = await request('/api/admin/me'); document.getElementById('myAccountUsername').value = me.user.username; await loadUsers(); }
    catch (_) {}
  }

  window.AdminRBAC = { init, loadUsers };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
