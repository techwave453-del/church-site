# Admin Panel Modularization

This directory is the new home for the admin panel's smaller modules.

## Refactor rules

- Preserve all existing API endpoints and data shapes.
- Preserve admin authentication and session behavior.
- Do not change public URLs/routes unless required.
- Move one responsibility at a time and verify the site after each step.
- Keep the current `admin.html` working until the replacement module is verified.

## Planned modules

- `css/admin.css` — admin-only styles
- `js/admin-core.js` — shared state, API helpers, escaping and notifications
- `js/auth.js` — login, session checking and logout
- `js/website-content.js` — church, about, services, links and classes
- `js/media-library.js` — uploads, listing, deletion and clipboard URL copying
- `js/live-stream.js` — live-stream settings
- `js/comments.js` — live comments moderation/listing

The first functional extraction will be the Media Library because it is isolated and includes the requested Copy URL behavior.
