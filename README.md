# AIC Kitanga Church Landing Site

A full-featured church landing page with a React + Vite frontend and Express backend featuring an admin panel with SQLite database for content management.

## Features

- **Landing Page**: Beautiful church landing page with video background, audio toggle, and gallery carousel
- **Admin Panel**: Secure admin dashboard to manage site content, media uploads, and configuration
- **Content Management**: Update church name, tagline, hero text, call-to-action, and media URLs
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

Edit `src/main.jsx` to customize:
- Church name, tagline, and hero text
- Default video and audio URLs
- Gallery slides
- CTA button text

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

