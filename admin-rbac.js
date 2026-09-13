import bcrypt from 'bcryptjs';

export const ADMIN_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  CONTENT_EDITOR: 'content_editor',
  MEDIA_MANAGER: 'media_manager',
  LIVE_MANAGER: 'live_manager',
  CUSTOM: 'custom'
});

export const ADMIN_PERMISSIONS = Object.freeze([
  'site.view','site.edit','media.view','media.upload','media.edit','media.delete',
  'comments.view','comments.moderate','live.view','live.edit','theme.view','theme.edit',
  'pages.view','pages.create','pages.edit','pages.delete','navigation.edit','site.publish',
  'users.view','users.create','users.edit','users.disable','users.delete','users.permissions','audit.view'
]);

export const ROLE_PERMISSIONS = Object.freeze({
  [ADMIN_ROLES.SUPER_ADMIN]: [...ADMIN_PERMISSIONS],
  [ADMIN_ROLES.CONTENT_EDITOR]: ['site.view', 'site.edit', 'pages.view', 'pages.create', 'pages.edit', 'navigation.edit'],
  [ADMIN_ROLES.MEDIA_MANAGER]: ['media.view', 'media.upload', 'media.edit', 'media.delete'],
  [ADMIN_ROLES.LIVE_MANAGER]: ['comments.view', 'comments.moderate', 'live.view', 'live.edit'],
  [ADMIN_ROLES.CUSTOM]: []
});

export function isSuperAdmin(user) { return user?.role === ADMIN_ROLES.SUPER_ADMIN; }
export function rolePermissions(user, assignedPermissions = []) { if (isSuperAdmin(user)) return new Set(ADMIN_PERMISSIONS); return new Set([...(ROLE_PERMISSIONS[user?.role] || []), ...(assignedPermissions || [])]); }
export function hasPermission(user, permission, assignedPermissions = []) { return isSuperAdmin(user) || rolePermissions(user, assignedPermissions).has(permission); }
export function sanitizeAdminUser(user) {
  if (!user) return null;
  return { id:user.id, username:user.username, role:user.role, is_active:user.is_active !== false, must_change_password:user.must_change_password === true, created_at:user.created_at ?? null, updated_at:user.updated_at ?? null, last_login_at:user.last_login_at ?? null };
}
export function validatePassword(password) { const value=String(password||''); if(value.length<10)return 'Password must be at least 10 characters long.'; if(!/[A-Za-z]/.test(value)||!/[0-9]/.test(value))return 'Password must contain at least one letter and one number.'; return null; }
export function hashPassword(password) { return bcrypt.hashSync(String(password),12); }
export function normalizeUsername(username) { return String(username||'').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,80); }
