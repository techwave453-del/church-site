import { ADMIN_ROLES } from './admin-rbac.js';
import { createAdminRbacService } from './admin-rbac-service.js';

export function registerAdminRbacRoutes({ app, supabase, requireAdmin, requireSameOrigin }) {
  if (!supabase) return;
  const rbac = createAdminRbacService({ supabase });

  async function currentAdmin(req) {
    if (!req.session.user?.id) return null;
    return rbac.getUserWithPermissions(req.session.user.id);
  }

  function requirePermission(permission) {
    return async (req, res, next) => {
      try {
        const user = await currentAdmin(req);
        if (!user || !user.is_active) return res.status(401).json({ error: 'Unauthorized.' });
        if (!rbac.hasPermission(user, permission, user.permissions)) return res.status(403).json({ error: 'You do not have permission for this action.' });
        req.adminUser = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to verify administrator permissions.' });
      }
    };
  }

  // Gate the existing admin APIs as well as the RBAC management APIs. These
  // middleware-only routes call next(), allowing the existing handlers in
  // server.js to remain unchanged while adding server-side authorization.
  app.put('/api/site/content', requireSameOrigin, requireAdmin, requirePermission('site.edit'), (_req, _res, next) => next());
  app.post('/api/media', requireSameOrigin, requireAdmin, requirePermission('media.upload'), (_req, _res, next) => next());
  app.patch('/api/media/:id', requireSameOrigin, requireAdmin, requirePermission('media.edit'), (_req, _res, next) => next());
  app.delete('/api/media/:id', requireSameOrigin, requireAdmin, requirePermission('media.delete'), (_req, _res, next) => next());
  app.get('/api/admin/live/comments', requireAdmin, requirePermission('comments.view'), (_req, _res, next) => next());
  app.patch('/api/admin/live/comments/:id', requireSameOrigin, requireAdmin, requirePermission('comments.moderate'), (_req, _res, next) => next());
  app.delete('/api/admin/live/comments/:id', requireSameOrigin, requireAdmin, requirePermission('comments.moderate'), (_req, _res, next) => next());

  app.get('/api/admin/me', requireAdmin, async (req, res) => {
    try {
      const user = await currentAdmin(req);
      if (!user || !user.is_active) return res.status(401).json({ error: 'Unauthorized.' });
      res.json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Unable to load administrator profile.' });
    }
  });

  app.get('/api/admin/users', requireSameOrigin, requireAdmin, requirePermission('users.view'), async (_req, res) => {
    try { res.json(await rbac.listUsers()); }
    catch (error) { console.error(error); res.status(500).json({ error: 'Unable to load administrators.' }); }
  });

  app.post('/api/admin/users', requireSameOrigin, requireAdmin, requirePermission('users.create'), async (req, res) => {
    try {
      const { username, password, role, permissions } = req.body || {};
      if (role === ADMIN_ROLES.SUPER_ADMIN && req.adminUser.role !== ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'Only a Super Admin can create another Super Admin.' });
      const user = await rbac.createUser({ username, password, role, permissions });
      res.status(201).json({ user });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to create administrator.' }); }
  });

  app.patch('/api/admin/users/:id', requireSameOrigin, requireAdmin, requirePermission('users.edit'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const target = await rbac.getUser(id);
      if (!target) return res.status(404).json({ error: 'Administrator not found.' });
      if (target.role === ADMIN_ROLES.SUPER_ADMIN && req.adminUser.role !== ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'Only a Super Admin can modify a Super Admin.' });
      if (req.body?.role === ADMIN_ROLES.SUPER_ADMIN && req.adminUser.role !== ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'Only a Super Admin can assign the Super Admin role.' });
      const user = await rbac.updateUser(id, req.body || {});
      res.json({ user });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to update administrator.' }); }
  });

  app.patch('/api/admin/users/:id/status', requireSameOrigin, requireAdmin, requirePermission('users.disable'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const target = await rbac.getUser(id);
      if (!target) return res.status(404).json({ error: 'Administrator not found.' });
      if (target.role === ADMIN_ROLES.SUPER_ADMIN && req.adminUser.role !== ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'Only a Super Admin can change Super Admin status.' });
      const user = await rbac.setStatus(id, req.body?.is_active);
      res.json({ user });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to change administrator status.' }); }
  });

  app.delete('/api/admin/users/:id', requireSameOrigin, requireAdmin, requirePermission('users.delete'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const target = await rbac.getUser(id);
      if (!target) return res.status(404).json({ error: 'Administrator not found.' });
      if (target.role === ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'A Super Admin cannot be deleted.' });
      await rbac.deleteUser(id);
      res.json({ ok: true });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to delete administrator.' }); }
  });

  app.put('/api/admin/users/:id/permissions', requireSameOrigin, requireAdmin, requirePermission('users.permissions'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const target = await rbac.getUser(id);
      if (!target) return res.status(404).json({ error: 'Administrator not found.' });
      if (target.role === ADMIN_ROLES.SUPER_ADMIN) return res.status(403).json({ error: 'A Super Admin already has all permissions.' });
      const user = await rbac.setPermissions(id, req.body?.permissions || []);
      res.json({ user });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to update permissions.' }); }
  });

  app.post('/api/admin/users/:id/password', requireSameOrigin, requireAdmin, requirePermission('users.edit'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const target = await rbac.getUser(id);
      if (!target) return res.status(404).json({ error: 'Administrator not found.' });
      if (target.role === ADMIN_ROLES.SUPER_ADMIN && req.adminUser.role !== ADMIN_ROLES.SUPER_ADMIN && id !== req.adminUser.id) return res.status(403).json({ error: 'Only a Super Admin can change another Super Admin password.' });
      await rbac.changePassword(id, req.body?.password);
      res.json({ ok: true });
    } catch (error) { console.error(error); res.status(400).json({ error: error.message || 'Unable to change password.' }); }
  });

  return { rbac, requirePermission };
}
