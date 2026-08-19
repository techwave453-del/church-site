# AIC Kitanga Church Landing Site

A React + Vite church website with an Express backend, SQLite content store, media library, and admin panel.

## Features

- Responsive church landing page with video background and carousel
- Admin dashboard for site content and media management
- SQLite storage for content and media metadata
- bcrypt password hashing
- Session-based admin authentication
- Image, video, audio, and document uploads

## Stack

- React 19 + Vite 8
- Express 5
- better-sqlite3
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

## Production configuration

Copy `.env.example` and provide real values:

```text
NODE_ENV=production
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-long-random-password
SESSION_SECRET=your-random-secret-at-least-32-characters
DATA_DIR=/persistent/path/site-data
UPLOAD_DIR=/persistent/path/uploads
```

In production the server refuses to start if `ADMIN_USERNAME`, `ADMIN_PASSWORD`, or `SESSION_SECRET` is missing. `SESSION_SECRET` must be at least 32 characters.

Build and start:

```bash
npm run build
npm start
```

The public site and admin panel are served by the same Express process. The admin page is available at `/admin`.

## Persistent storage

The SQLite database and uploaded files are runtime data and are intentionally excluded from Git. Use persistent storage in production. Ephemeral filesystems can cause content and uploads to disappear after a restart or redeploy.

## Render example

Use a Web Service:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

Mount a persistent disk and configure `DATA_DIR` and `UPLOAD_DIR` to paths on that disk.

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

## Project structure

```text
src/
  main.jsx       # React application
  styles.css     # Site/admin styles
server.js        # Express API and server
site-config.js   # Default site content
vite.config.js   # Vite configuration
data/            # Runtime SQLite data; not committed
uploads/         # Runtime uploads; not committed
```

## Important deployment notes

- Use HTTPS in production so secure session cookies are enabled.
- Keep `DATA_DIR` and `UPLOAD_DIR` on persistent storage.
- Do not commit `.env`, database files, or uploaded media.
- Replace placeholder church content and third-party image URLs before launch.

## License

© 2026 AIC Kitanga. All rights reserved.
