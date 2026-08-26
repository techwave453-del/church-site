/* Admin Users UI helper. The existing admin page can load this module from its Users section. */
(() => {
  'use strict';
  const mount = document.getElementById('adminUsersManagement');
  if (!mount) return;
  mount.innerHTML = `
    <div class="admin-users-toolbar">
      <div><h3>Administrator Users</h3><p>Manage administrator accounts and access.</p></div>
      <button type="button" id="addAdministratorButton">+ Add Administrator</button>
    </div>
    <div id="addAdministratorForm" hidden>
      <form id="administratorCreateForm" autocomplete="off">
        <label>Username<input name="username" required maxlength="80" placeholder="Enter username"></label>
        <label>Role<select name="role"><option value="content_editor">Content Editor</option><option value="media_manager">Media Manager</option><option value="moderator">Moderator</option><option value="admin">Administrator</option></select></label>
        <div><button type="submit">Create Administrator</button><button type="button" id="cancelAdministratorButton">Cancel</button></div>
        <p id="administratorCreateMessage" role="status"></p>
      </form>
    </div>`;
  const form = document.getElementById('administratorCreateForm');
  document.getElementById('addAdministratorButton').onclick = () => { document.getElementById('addAdministratorForm').hidden = false; form.elements.username.focus(); };
  document.getElementById('cancelAdministratorButton').onclick = () => { document.getElementById('addAdministratorForm').hidden = true; form.reset(); };
  form.onsubmit = async (event) => {
    event.preventDefault();
    const message = document.getElementById('administratorCreateMessage');
    message.textContent = 'Creating…';
    try {
      const body = { username: form.elements.username.value.trim(), role: form.elements.role.value };
      const response = await fetch('/api/admin/users', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to create administrator.');
      message.textContent = `Administrator ${data.user?.username || body.username} created. Continue with the access approval/activation process.`;
      form.reset();
      if (typeof window.loadAdminUsers === 'function') window.loadAdminUsers();
    } catch (error) { message.textContent = error.message; }
  };
})();
