/* Admin Users UI: creation, approval and security-scoped permission assignment. */
(() => {
  'use strict';
  const mount = document.getElementById('adminUsersManagement') || document.getElementById('adminUsersPanel');
  if (!mount) return;

  const roles = [
    ['content_editor', 'Content Editor'],
    ['media_manager', 'Media Manager'],
    ['live_manager', 'Live Manager'],
    ['custom', 'Custom Permissions']
  ];

  // Keep this catalogue aligned with the server-side RBAC model.
  // Broad legacy permissions such as site.edit are deliberately not offered here.
  const permissionGroups = [
    {
      title: '🔒 Church Identity',
      description: 'Official church identity is a protected security boundary.',
      items: [
        ['identity.view', 'View Church Identity', true],
        ['identity.edit', 'Edit Church Identity', true]
      ]
    },
    {
      title: '🌐 Website Content',
      description: 'Content permissions are scoped to individual website areas.',
      items: [
        ['content.homepage.edit', 'Edit Homepage', false],
        ['content.about.edit', 'Edit About', false],
        ['content.services.edit', 'Edit Services', false],
        ['content.links.edit', 'Edit Homepage Links', false],
        ['content.classes.edit', 'Edit Classes', false],
        ['content.gallery.edit', 'Edit Gallery', false]
      ]
    },
    {
      title: '🎥 Media Library',
      description: 'Media access does not grant access to Church Identity.',
      items: [
        ['media.view', 'View Media', false],
        ['media.upload', 'Upload Media', false],
        ['media.edit', 'Edit Media', false],
        ['media.delete', 'Delete Media', false]
      ]
    },
    {
      title: '📡 Live & Comments',
      description: 'Manage live-stream operations independently from website content.',
      items: [
        ['live.view', 'View Live Stream', false],
        ['live.edit', 'Manage Live Stream', false],
        ['comments.view', 'View Live Comments', false],
        ['comments.moderate', 'Moderate Live Comments', false]
      ]
    },
    {
      title: '🎨 Theme',
      description: 'Theme settings are separate from content and identity.',
      items: [
        ['theme.view', 'View Theme', false],
        ['theme.edit', 'Edit Theme', false]
      ]
    },
    {
      title: '⚙️ Administration',
      description: 'Administrative permissions can affect other administrator accounts.',
      items: [
        ['users.view', 'View Administrators', true],
        ['users.create', 'Create Administrators', true],
        ['users.edit', 'Edit Administrators', true],
        ['users.disable', 'Enable / Disable Administrators', true],
        ['users.delete', 'Delete Administrators', true],
        ['users.permissions', 'Manage Permissions', true],
        ['audit.view', 'View Audit Logs', true]
      ]
    }
  ];

  const allPermissionItems = permissionGroups.flatMap(group => group.items);
  const privilegedPermissions = new Set(allPermissionItems.filter(item => item[2]).map(item => item[0]));
  const permissionLabel = permission => allPermissionItems.find(item => item[0] === permission)?.[1] || permission;
  const esc = value => String(value ?? '').replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const api = async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: {'Content-Type': 'application/json', ...(options.headers || {})}
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  };

  let currentAdmin = null;
  let isSuperAdmin = false;

  const message = text => {
    const el = document.getElementById('adminUsersMessage');
    if (el) el.textContent = text || '';
  };

  mount.innerHTML = `
    <div class="admin-users-toolbar">
      <div>
        <h2>Users &amp; Permissions</h2>
        <p>Approve administrators and assign only the access they need. Protected permissions are clearly marked.</p>
      </div>
      <button type="button" id="addAdministratorButton">+ Create User</button>
    </div>
    <div id="adminUsersMessage" role="status" aria-live="polite"></div>

    <div id="addAdministratorForm" hidden>
      <form id="administratorCreateForm" autocomplete="off">
        <label>Username<input name="username" required maxlength="40" pattern="[A-Za-z0-9._-]{3,40}" placeholder="Enter username"></label>
        <p class="muted">The account remains pending until an authorized administrator approves it. No activation code is displayed here.</p>
        <div class="toolbar">
          <button type="submit">Create Pending Request</button>
          <button type="button" class="secondary" id="cancelAdministratorButton">Cancel</button>
        </div>
      </form>
    </div>

    <section id="adminPendingRequests" class="admin-users-card">
      <h3>Pending Approval</h3>
      <p class="muted">Pending requests are where role and permissions are assigned.</p>
      <div id="pendingRequestsList">Loading…</div>
    </section>

    <section class="admin-users-card">
      <h3>Active Administrators</h3>
      <div id="adminUsersList">Loading…</div>
    </section>

    <div id="adminApprovalModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="adminApprovalTitle">
      <div class="modal-card">
        <div class="modal-head">
          <div><h2 id="adminApprovalTitle">Approve Administrator</h2><p id="approvalUsername" class="muted"></p></div>
          <button type="button" class="secondary small" id="closeApproval">Close</button>
        </div>
        <div id="approvalBody"></div>
      </div>
    </div>`;

  const form = document.getElementById('administratorCreateForm');
  document.getElementById('addAdministratorButton').onclick = () => {
    document.getElementById('addAdministratorForm').hidden = false;
    form.elements.username.focus();
  };
  document.getElementById('cancelAdministratorButton').onclick = () => {
    document.getElementById('addAdministratorForm').hidden = true;
    form.reset();
  };

  form.onsubmit = async event => {
    event.preventDefault();
    message('Creating pending request…');
    try {
      await api('/api/admin/access/request', {
        method: 'POST',
        body: JSON.stringify({username: form.elements.username.value.trim()})
      });
      message('Administrator request created and is now pending approval.');
      form.reset();
      document.getElementById('addAdministratorForm').hidden = true;
      await loadPending();
    } catch (error) {
      message(error.message);
    }
  };

  async function loadCurrentAdmin() {
    try {
      currentAdmin = await api('/api/admin/me');
      isSuperAdmin = currentAdmin?.role === 'super_admin';
    } catch (_) {
      currentAdmin = null;
      isSuperAdmin = false;
    }
  }

  function renderPermissionGroups() {
    return permissionGroups.map(group => `
      <section class="permission-group" style="border:1px solid #e3e8ed;border-radius:12px;padding:12px;margin-top:12px;background:#fafbfc">
        <div style="margin-bottom:8px">
          <strong>${esc(group.title)}</strong>
          <div class="muted small">${esc(group.description)}</div>
        </div>
        ${group.items.map(([value, label, privileged]) => {
          const locked = privileged && !isSuperAdmin;
          const marker = privileged ? ' <span class="status" style="margin-left:4px">🔒 Super Admin only</span>' : '';
          const disabled = locked ? ' disabled' : '';
          const explanation = locked ? '<div class="muted small" style="margin-left:26px">You cannot grant this permission from this account.</div>' : '';
          return `<label style="display:block;margin:8px 0;font-weight:500;${locked?'opacity:.65':''}"><input type="checkbox" name="permission" value="${esc(value)}"${disabled}> ${esc(label)}${marker}</label>${explanation}`;
        }).join('')}
      </section>`).join('');
  }

  async function loadPending() {
    const box = document.getElementById('pendingRequestsList');
    try {
      const rows = await api('/api/admin/access/requests');
      const pending = rows.filter(row => row.status === 'pending');
      box.innerHTML = pending.map(row => `
        <article class="admin-user-row" style="padding:12px 0;border-top:1px solid #eee">
          <div><strong>${esc(row.username)}</strong><div class="muted small">${row.selected_choice ? 'Requester verification is ready.' : 'Waiting for requester verification.'}</div></div>
          <div class="toolbar">
            <span class="status">Pending</span>
            <button type="button" class="primary small" data-approve="${esc(row.id)}">Review &amp; Approve</button>
            <button type="button" class="danger small" data-reject="${esc(row.id)}">Decline</button>
          </div>
        </article>`).join('') || '<p class="muted">No pending administrator requests.</p>';
      box.querySelectorAll('[data-approve]').forEach(button => button.onclick = () => openApproval(pending.find(row => String(row.id) === String(button.dataset.approve))));
      box.querySelectorAll('[data-reject]').forEach(button => button.onclick = () => rejectRequest(button.dataset.reject));
    } catch (error) {
      box.textContent = error.message;
    }
  }

  async function loadUsers() {
    const box = document.getElementById('adminUsersList');
    try {
      const users = await api('/api/admin/users');
      box.innerHTML = users.map(user => {
        const permissions = Array.isArray(user.permissions) ? user.permissions : [];
        const isTargetSuperAdmin = user.role === 'super_admin';
        const visiblePermissions = isTargetSuperAdmin
          ? '<span class="status ok">All permissions</span>'
          : permissions.length
            ? permissions.map(permission => `<span class="status" style="margin:2px 4px 2px 0;display:inline-block">${esc(permissionLabel(permission))}</span>`).join('')
            : '<span class="muted small">No additional permissions</span>';
        return `<article class="admin-user-row" style="padding:12px 0;border-top:1px solid #eee">
          <div style="min-width:0;flex:1"><strong>${esc(user.username)}</strong><div class="muted small">Role: ${esc(user.role)}</div><div style="margin-top:6px">${visiblePermissions}</div></div>
          <span class="status ${user.is_active?'ok':'bad'}">${user.is_active?'Active':'Disabled'}</span>
        </article>`;
      }).join('') || '<p class="muted">No administrators found.</p>';
    } catch (error) {
      box.textContent = error.message;
    }
  }

  async function rejectRequest(id) {
    if (!confirm('Decline this administrator request?')) return;
    try {
      await api(`/api/admin/access/requests/${encodeURIComponent(id)}/reject`, {method:'POST'});
      message('Request declined.');
      await loadPending();
    } catch (error) {
      message(error.message);
    }
  }

  function openApproval(row) {
    if (!row) return;
    const modal = document.getElementById('adminApprovalModal');
    const body = document.getElementById('approvalBody');
    document.getElementById('approvalUsername').textContent = `Username: ${row.username}`;

    const roleOptions = roles.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
    body.innerHTML = `
      <div class="admin-security-notice" style="padding:11px 13px;border-radius:9px;background:#eef6ff;margin-bottom:12px">
        <strong>Security-scoped access</strong>
        <div class="muted small">Church Identity and administrator-management permissions are protected. Only a Super Admin can grant those permissions.</div>
      </div>
      <p><strong>Verification check</strong></p>
      <p class="muted">The requester must complete the verification step before approval.</p>
      <label>Verification number<select id="approvalChoice"><option value="">Select</option>${[row.choice_one,row.choice_two,row.choice_three].filter(Boolean).map(choice => `<option value="${esc(choice)}">${esc(choice)}</option>`).join('')}</select></label>
      <label>Role<select id="approvalRole">${roleOptions}</select></label>
      <div style="margin-top:14px"><strong>Permissions</strong><div class="muted small">Grant the minimum access required for the administrator's work.</div>${renderPermissionGroups()}</div>
      <div class="toolbar" style="margin-top:16px">
        <button type="button" class="primary" id="approveConfirm">Approve &amp; Grant Access</button>
        <button type="button" class="secondary" id="approvalCancel">Cancel</button>
      </div>
      <p id="approvalError" class="error"></p>`;

    modal.classList.remove('hidden');
    document.getElementById('approvalCancel').onclick = closeApproval;
    document.getElementById('approveConfirm').onclick = async () => {
      const error = document.getElementById('approvalError');
      const choice = document.getElementById('approvalChoice').value;
      const role = document.getElementById('approvalRole').value;
      const selected = [...document.querySelectorAll('#approvalBody input[name="permission"]:checked')].map(input => input.value);
      if (!choice) {
        error.textContent = 'Select the verification number.';
        return;
      }
      // Client-side guard for a clear UX. The server remains authoritative.
      if (!isSuperAdmin && selected.some(permission => privilegedPermissions.has(permission))) {
        error.textContent = 'Only a Super Admin can assign protected administration permissions.';
        return;
      }
      try {
        await api(`/api/admin/access/requests/${encodeURIComponent(row.id)}/approve`, {
          method: 'POST',
          body: JSON.stringify({choice, role, permissions: selected})
        });
        closeApproval();
        message('Administrator approved and access assigned.');
        await Promise.all([loadPending(), loadUsers()]);
      } catch (requestError) {
        error.textContent = requestError.message;
      }
    };
  }

  function closeApproval() {
    document.getElementById('adminApprovalModal').classList.add('hidden');
  }

  document.getElementById('closeApproval').onclick = closeApproval;

  (async () => {
    await loadCurrentAdmin();
    await Promise.all([loadPending(), loadUsers()]);
  })();
})();