/* Admin Users UI: creation, pending approval and permission assignment. */
(() => {
  'use strict';
  const mount = document.getElementById('adminUsersManagement') || document.getElementById('adminUsersPanel');
  if (!mount) return;
  const roles = [
    ['content_editor','Content Editor'],
    ['media_manager','Media Manager'],
    ['live_manager','Live Manager'],
    ['custom','Custom Permissions']
  ];
  const permissions = [
    ['site.view','View website content'],['site.edit','Edit website content'],
    ['media.view','View media'],['media.upload','Upload media'],['media.edit','Edit media'],['media.delete','Delete media'],
    ['comments.view','View live comments'],['comments.moderate','Moderate live comments'],
    ['live.view','View live stream'],['live.edit','Manage live stream'],
    ['theme.view','View theme'],['theme.edit','Edit theme'],['users.view','View administrators'],['users.create','Create administrators'],
    ['users.edit','Edit administrators'],['users.disable','Enable/disable administrators'],['users.delete','Delete administrators'],['users.permissions','Manage permissions'],['audit.view','View audit logs']
  ];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const api = async (url, options={}) => { const response = await fetch(url,{credentials:'same-origin',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}}); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.error||'Request failed.'); return data; };
  const message = text => { const el=document.getElementById('adminUsersMessage'); if(el) el.textContent=text||''; };

  mount.innerHTML = `
    <div class="admin-users-toolbar"><div><h2>Admin Users</h2><p>Create requests, then approve each administrator with the required role and permissions.</p></div><button type="button" id="addAdministratorButton">+ Create User</button></div>
    <div id="adminUsersMessage" role="status" aria-live="polite"></div>
    <div id="addAdministratorForm" hidden><form id="administratorCreateForm" autocomplete="off"><label>Username<input name="username" required maxlength="40" pattern="[A-Za-z0-9._-]{3,40}" placeholder="Enter username"></label><p class="muted">The user will remain pending until the Super Admin approves the request. No activation code is displayed here.</p><div><button type="submit">Create Pending Request</button><button type="button" id="cancelAdministratorButton">Cancel</button></div></form></div>
    <section id="adminPendingRequests" class="admin-users-card"><h3>Pending Approval</h3><div id="pendingRequestsList">Loading…</div></section>
    <section class="admin-users-card"><h3>Active Administrators</h3><div id="adminUsersList">Loading…</div></section>
    <div id="adminApprovalModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="adminApprovalTitle"><div class="modal-card"><div class="modal-head"><div><h2 id="adminApprovalTitle">Approve Administrator</h2><p id="approvalUsername" class="muted"></p></div><button type="button" class="secondary small" id="closeApproval">Close</button></div><div id="approvalBody"></div></div></div>`;

  const form=document.getElementById('administratorCreateForm');
  document.getElementById('addAdministratorButton').onclick=()=>{document.getElementById('addAdministratorForm').hidden=false;form.elements.username.focus();};
  document.getElementById('cancelAdministratorButton').onclick=()=>{document.getElementById('addAdministratorForm').hidden=true;form.reset();};
  form.onsubmit=async e=>{e.preventDefault();message('Creating pending request…');try{await api('/api/admin/users',{method:'POST',body:JSON.stringify({username:form.elements.username.value.trim()})});message('Administrator request created and is now pending approval.');form.reset();document.getElementById('addAdministratorForm').hidden=true;await loadPending();}catch(error){message(error.message);}};

  async function loadPending(){
    const box=document.getElementById('pendingRequestsList');
    try{const rows=await api('/api/admin/access/requests');
      box.innerHTML=rows.filter(r=>r.status==='pending').map(r=>`<article class="admin-user-row" style="padding:12px 0;border-top:1px solid #eee"><div><strong>${esc(r.username)}</strong><div class="muted small">Verification: ${r.selected_choice?`requester selected <strong>${esc(r.selected_choice)}</strong>`:'waiting for requester selection'}</div></div><div class="toolbar"><span class="status">Pending</span><button type="button" class="primary small" data-approve="${esc(r.id)}">Approve</button><button type="button" class="danger small" data-reject="${esc(r.id)}">Decline</button></div></article>`).join('') || '<p class="muted">No pending administrator requests.</p>';
      box.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>openApproval(rows.find(r=>String(r.id)===String(b.dataset.approve))));
      box.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>rejectRequest(b.dataset.reject));
    }catch(error){box.textContent=error.message;}
  }
  async function loadUsers(){
    const box=document.getElementById('adminUsersList');
    try{const users=await api('/api/admin/users');box.innerHTML=users.map(u=>`<article class="admin-user-row" style="padding:10px 0;border-top:1px solid #eee"><div><strong>${esc(u.username)}</strong><div class="muted small">${esc(u.role)}</div></div><span class="status ${u.is_active?'ok':'bad'}">${u.is_active?'Active':'Disabled'}</span></article>`).join('')||'<p class="muted">No administrators found.</p>';}catch(error){box.textContent=error.message;}
  }
  async function rejectRequest(id){if(!confirm('Decline this administrator request?'))return;try{await api(`/api/admin/access/requests/${encodeURIComponent(id)}/reject`,{method:'POST'});message('Request declined.');await loadPending();}catch(error){message(error.message);}}
  function openApproval(row){
    const modal=document.getElementById('adminApprovalModal');const body=document.getElementById('approvalBody');document.getElementById('approvalUsername').textContent=`Username: ${row.username}`;
    const roleOptions=roles.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
    const permissionOptions=permissions.map(([v,l])=>`<label style="display:flex;gap:8px;align-items:center;margin:6px 0;font-weight:500"><input type="checkbox" name="permission" value="${v}"> ${l}</label>`).join('');
    body.innerHTML=`<p><strong>Verification check</strong></p><p class="muted">The requester selected <strong>${row.selected_choice?esc(row.selected_choice):'nothing yet'}</strong>. Choose the same number to confirm the request.</p><label>Verification number<select id="approvalChoice"><option value="">Select</option>${[row.choice_one,row.choice_two,row.choice_three].map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label><label>Role<select id="approvalRole">${roleOptions}</select></label><div style="margin-top:12px"><strong>Additional permissions</strong>${permissionOptions}</div><div class="toolbar" style="margin-top:16px"><button type="button" class="primary" id="approveConfirm">Approve & Grant Access</button><button type="button" class="secondary" id="approvalCancel">Cancel</button></div><p id="approvalError" class="error"></p>`;
    modal.classList.remove('hidden');
    document.getElementById('approvalCancel').onclick=closeApproval;document.getElementById('approveConfirm').onclick=async()=>{const error=document.getElementById('approvalError');const choice=document.getElementById('approvalChoice').value;const role=document.getElementById('approvalRole').value;const selected=[...document.querySelectorAll('#approvalBody input[name="permission"]:checked')].map(x=>x.value);if(!choice){error.textContent='Select the verification number.';return;}try{await api(`/api/admin/access/requests/${encodeURIComponent(row.id)}/approve`,{method:'POST',body:JSON.stringify({choice,role,permissions:selected})});closeApproval();message('Administrator approved and access assigned. The activation code is delivered automatically to the requesting setup session.');await Promise.all([loadPending(),loadUsers()]);}catch(e){error.textContent=e.message;}};
  }
  function closeApproval(){document.getElementById('adminApprovalModal').classList.add('hidden');}
  document.getElementById('closeApproval').onclick=closeApproval;
  loadPending();loadUsers();
})();
