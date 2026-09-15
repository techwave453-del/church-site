import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_PERMISSIONS, ADMIN_ROLES, hasPermission, rolePermissions } from '../admin-rbac.js';

test('event permissions are part of the server authorization vocabulary', () => {
  for (const permission of ['events.view', 'events.create', 'events.edit', 'events.delete']) {
    assert.ok(ADMIN_PERMISSIONS.includes(permission));
  }
});

test('Super Admin has every permission', () => {
  const user = { role: ADMIN_ROLES.SUPER_ADMIN };
  for (const permission of ADMIN_PERMISSIONS) assert.equal(hasPermission(user, permission), true);
});

test('Content Editor receives event administration but not system administration', () => {
  const user = { role: ADMIN_ROLES.CONTENT_EDITOR };
  const permissions = rolePermissions(user);
  assert.equal(permissions.has('events.view'), true);
  assert.equal(permissions.has('events.create'), true);
  assert.equal(permissions.has('events.edit'), true);
  assert.equal(permissions.has('events.delete'), true);
  assert.equal(permissions.has('users.permissions'), false);
  assert.equal(permissions.has('identity.edit'), false);
});

test('Custom administrator receives no implicit permissions', () => {
  const user = { role: ADMIN_ROLES.CUSTOM };
  assert.equal(hasPermission(user, 'events.edit'), false);
});
