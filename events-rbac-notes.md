Event mutation endpoints identified for granular RBAC hardening:
- POST /api/admin/events -> events.create
- PUT /api/admin/events/:id -> events.edit
- DELETE /api/admin/events/:id -> events.delete
Public GET /api/events and /api/events/:slug remain unchanged.
