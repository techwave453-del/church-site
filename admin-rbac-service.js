import bcrypt from 'bcryptjs';
import { ADMIN_ROLES, ADMIN_PERMISSIONS, hasPermission, hashPassword, normalizeUsername, validatePassword, sanitizeAdminUser } from './admin-rbac.js';

export function createAdminRbacService({ supabase }) {
  if (!supabase) throw new Error('RBAC service requires Supabase.');

  async function getUser(userId) {
    const { data, error } = await supabase.from('admin_users').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function getPermissions(userId) {
    const { data, error } = await supabase.from('admin_permissions').select('permission').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(row => row.permission);
  }

  async function getUserWithPermissions(userId) {
    const user = await getUser(userId);
    if (!user) return null;
    return { ...sanitizeAdminUser(user), permissions: await getPermissions(userId) };
  }

  async function listUsers() {
    const { data, error } = await supabase.from('admin_users').select('id,username,role,is_active,created_at,updated_at,last_login_at').order('username');
    if (error) throw error;
    const users = data || [];
    return Promise.all(users.map(async user => ({ ...user, permissions: await getPermissions(user.id) })));
  }

  async function createUser({ username, password, role = ADMIN_ROLES.CUSTOM, permissions = [] }) {
    const normalized = normalizeUsername(username);
    if (!normalized) throw new Error('A valid username is required.');
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    if (!Object.values(ADMIN_ROLES).includes(role)) throw new Error('Invalid administrator role.');
    const selected = [...new Set((permissions || []).filter(permission => ADMIN_PERMISSIONS.includes(permission)))];

    const existing = await supabase.from('admin_users').select('id').eq('username', normalized).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) throw new Error('That username is already in use.');

    const inserted = await supabase.from('admin_users').insert({ username: normalized, password_hash: hashPassword(password), role, is_active: true }).select('id,username,role,is_active,created_at,updated_at,last_login_at').single();
    if (inserted.error) throw inserted.error;

    if (selected.length) {
      const result = await supabase.from('admin_permissions').insert(selected.map(permission => ({ user_id: inserted.data.id, permission })));
      if (result.error) throw result.error;
    }
    return getUserWithPermissions(inserted.data.id);
  }

  async function updateUser(userId, changes = {}) {
    const target = await getUser(userId);
    if (!target) throw new Error('Administrator not found.');
    const patch = {};
    if (changes.username !== undefined) {
      const username = normalizeUsername(changes.username);
      if (!username) throw new Error('A valid username is required.');
      const duplicate = await supabase.from('admin_users').select('id').eq('username', username).neq('id', userId).maybeSingle();
      if (duplicate.error) throw duplicate.error;
      if (duplicate.data) throw new Error('That username is already in use.');
      patch.username = username;
    }
    if (changes.role !== undefined) {
      if (!Object.values(ADMIN_ROLES).includes(changes.role)) throw new Error('Invalid administrator role.');
      patch.role = changes.role;
    }
    if (Object.keys(patch).length) {
      patch.updated_at = new Date().toISOString();
      const result = await supabase.from('admin_users').update(patch).eq('id', userId);
      if (result.error) throw result.error;
    }
    if (changes.permissions !== undefined) await setPermissions(userId, changes.permissions);
    return getUserWithPermissions(userId);
  }

  async function setStatus(userId, isActive) {
    const target = await getUser(userId);
    if (!target) throw new Error('Administrator not found.');
    if (target.role === ADMIN_ROLES.SUPER_ADMIN && !isActive) {
      const { count, error } = await supabase.from('admin_users').select('id', { count: 'exact', head: true }).eq('role', ADMIN_ROLES.SUPER_ADMIN).eq('is_active', true);
      if (error) throw error;
      if ((count || 0) <= 1) throw new Error('The last active Super Admin cannot be disabled.');
    }
    const result = await supabase.from('admin_users').update({ is_active: Boolean(isActive), updated_at: new Date().toISOString() }).eq('id', userId);
    if (result.error) throw result.error;
    return getUserWithPermissions(userId);
  }

  async function deleteUser(userId) {
    const target = await getUser(userId);
    if (!target) throw new Error('Administrator not found.');
    if (target.role === ADMIN_ROLES.SUPER_ADMIN) throw new Error('A Super Admin cannot be deleted.');
    const result = await supabase.from('admin_users').delete().eq('id', userId);
    if (result.error) throw result.error;
  }

  async function setPermissions(userId, permissions = []) {
    const target = await getUser(userId);
    if (!target) throw new Error('Administrator not found.');
    if (target.role === ADMIN_ROLES.SUPER_ADMIN) return getUserWithPermissions(userId);
    const selected = [...new Set((permissions || []).filter(permission => ADMIN_PERMISSIONS.includes(permission)))];
    const removed = await supabase.from('admin_permissions').delete().eq('user_id', userId);
    if (removed.error) throw removed.error;
    if (selected.length) {
      const added = await supabase.from('admin_permissions').insert(selected.map(permission => ({ user_id: userId, permission })));
      if (added.error) throw added.error;
    }
    return getUserWithPermissions(userId);
  }

  async function changePassword(userId, password) {
    const target = await getUser(userId);
    if (!target) throw new Error('Administrator not found.');
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    const result = await supabase.from('admin_users').update({ password_hash: hashPassword(password), updated_at: new Date().toISOString() }).eq('id', userId);
    if (result.error) throw result.error;
  }

  return { getUser, getPermissions, getUserWithPermissions, listUsers, createUser, updateUser, setStatus, deleteUser, setPermissions, changePassword, hasPermission };
}
