# AIC Kitanga Church Landing Site

A React + Vite church website with an Express backend, Supabase persistent content store, Supabase Storage media library, and admin panel.

## Features

- Responsive church landing page with video background and carousel
- Admin dashboard for site content and media management
- Supabase PostgreSQL storage for content and media metadata
- Supabase Storage for image, video, audio, and document uploads
- bcrypt password hashing
- Session-based admin authentication

## Stack

- React 19 + Vite 8
- Express 5
- Supabase JavaScript client
- PostgreSQL via Supabase
- Supabase Storage
- bcryptjs
- Multer
- Lucide React

## Installation

```bash
npm install
```

## Development

Run frontend and backend together:

```bash
npm run dev:all
```

Or separately:

```bash
npm run dev:server
npm run dev
```

Frontend: `http://localhost:5173/`

Backend: `http://localhost:3001/`

Admin: `http://localhost:5173/admin`

Development uses `admin` / `admin123` only as local convenience defaults. **Never use those defaults in production.**

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase-schema.sql` from this repository.
4. Copy the project's URL and server-only service role key into the Render environment variables.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` secret. It must never be placed in frontend code.

The Express server uses the service-role key only on the server for database and Storage operations. The public website receives only the resulting media URLs.

## Production configuration

```text
NODE_ENV=production
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-long-random-password
SESSION_SECRET=your-random-secret-at-least-32-characters
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SUPABASE_STORAGE_BUCKET=church-media
```

In production the server refuses to start if the admin credentials, session secret, or Supabase connection are missing.

## Migration from SQLite

The repository retains `better-sqlite3` only as a migration bridge. If Supabase is configured and an existing `DATA_DIR/site.db` is present, the server automatically copies the existing site content, admin users, media metadata, and locally stored media files into Supabase on startup. Existing media files are uploaded to the `church-media` bucket and their database URLs are updated to permanent Supabase Storage URLs.

After the migration succeeds, production reads and writes exclusively from Supabase. New uploads are held in memory temporarily and written directly to Supabase Storage, so they do not depend on Render's local filesystem.

## Build and start

```bash
npm run build
npm start
```

The public site and admin panel are served by the same Express process. The admin page is available at `/admin`.

## Render

Use a Web Service:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

No Render persistent disk is required for production data. Configure the Supabase environment variables above in Render.

## API

### Authentication

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`

### Site content

- `GET /api/site/content`
- `PUT /api/site/content` (admin only)

### Media

- `GET /api/media`
- `POST /api/media` (admin only)
- `DELETE /api/media/:id` (admin only)

## Tests

```bash
npm test
```

## Important deployment notes

- Use HTTPS in production so secure session cookies are enabled.
- Never commit `.env`, Supabase service-role keys, database files, or uploaded media.
- The Supabase service-role key is server-only and bypasses RLS; never expose it to the browser.
- Supabase Storage is used for persistent church media instead of Render's ephemeral filesystem.
