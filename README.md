# AIC Kitanga Church Landing Site

A full-featured church landing page with a React + Vite frontend and Express backend featuring an admin panel with SQLite database for content management.

## Features

- **Landing Page**: Beautiful church landing page with video background, audio toggle, and gallery carousel
- **Admin Panel**: Secure admin dashboard to manage site content, media uploads, and configuration
- **Content Management**: Update church identity, hero content, About section, services, homepage links, membership classes, footer contacts, carousel slides, and media URLs
- **Media Library**: Upload and manage images, videos, audio, and documents
- **SQLite Database**: Persistent storage for admin users, site settings, and media metadata
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Secure admin login with bcrypt password hashing

## Tech Stack

- **Frontend**: React 19, Vite 8
- **Backend**: Express 5, better-sqlite3
- **Database**: SQLite3
- **Styling**: CSS3 with responsive design
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Task Runner**: npm with concurrently

## Installation

```bash
npm install
```

## Development

Start both frontend and backend:

```bash
npm run dev:all
```

Or run separately:

```bash
# Terminal 1 - Backend server
npm run dev:server

# Terminal 2 - Frontend dev server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173/
- Backend API: http://localhost:3001
- Admin Panel: http://localhost:5173/admin

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

**⚠️ Change these immediately in production!**

## Admin Access After Deployment

Build the frontend and start the Express production server:

```bash
npm run build
npm start
```

The public site is available at your deployed domain, and the admin page is available at the same domain with `/admin` appended:

```text
https://your-domain.example/admin
```

The admin login uses the `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` environment variables. Keep the `data/` and `uploads/` directories on persistent server storage because they contain the SQLite database and uploaded files. GitHub Pages is not sufficient for this deployment because it cannot run the Express API, sessions, SQLite database, or uploads.

### Render.com

Create a **Web Service** connected to this repository with:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

Add a Render persistent disk mounted at `/var/data`, then add these environment variables:

```text
DATA_DIR=/var/data/site-data
UPLOAD_DIR=/var/data/uploads
ADMIN_USERNAME=choose-a-username
ADMIN_PASSWORD=choose-a-long-password
SESSION_SECRET=choose-a-long-random-secret
```

After deployment, open `https://your-service-name.onrender.com/admin`. The public site is at the same address without `/admin`. A persistent disk is required or the SQLite database and uploaded files may be lost when Render restarts or redeploys the service.

## Project Structure

```
├── src/
│   ├── main.jsx          # React app with landing page & admin panel
│   └── styles.css        # All styling for both pages
├── server.js             # Express backend with SQLite
├── site-config.js        # Default site configuration
├── vite.config.js        # Vite configuration with API proxy
├── package.json          # Dependencies and scripts
└── data/                 # SQLite database storage
```

## API Endpoints

### Admin
- `POST /api/admin/login` - Login
- `GET /api/admin/session` - Check session
- `POST /api/admin/logout` - Logout

### Site Content
- `GET /api/site/content` - Get site settings
- `PUT /api/site/content` - Update site settings (admin only)

### Media
- `GET /api/media` - List all media
- `POST /api/media` - Upload new media (admin only)
- `DELETE /api/media/:id` - Delete media (admin only)

## Configuration

Use the admin page to customize the site after login. The Site tab includes:
- Church name, tagline, hero text, CTA, and media URLs
- About section headings and description
- Service headings, names, times, and images
- Homepage link titles, descriptions, destination URLs, and images
- Membership headings, class names, registration URLs, and images
- Footer tagline, phone, and email
- Carousel slide type and source URLs

## Building for Production

```bash
npm run build
```

This creates a production-optimized build in the `dist/` folder.

## Notes

- Hero video can be a local file or YouTube URL
- Background audio is controlled via YouTube iFrame API
- All media uploads are stored in the `uploads/` directory
- SQLite database file is created in the `data/` directory
- On Windows, use `cmd /c npm run dev:all` to bypass PowerShell execution policies

## License

© 2026 AIC Kitanga. All rights reserved.

