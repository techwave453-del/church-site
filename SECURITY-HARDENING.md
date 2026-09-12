# Security Hardening Roadmap

This file tracks security work for the church website.

## Active hardening

- Core church identity must not be editable through the general CMS.
- Site-content writes must use server-side allowlists and permissions.
- Uploads must validate MIME type, file signature, size, and allowed extensions.
- Dependency audits must fail on high-severity vulnerabilities.
- Production dependencies must be kept patched and the lockfile must remain reproducible.
- Security changes must pass tests, production build, and server syntax checks before merge.

## Dependency findings

The current audit reported a high-severity Multer vulnerability and a moderate `qs` vulnerability. The target patched releases are Multer 2.3.0 and `qs` 6.16.0 as of September 2026.

Do not bypass `npm audit` to obtain a green check. Update both `package.json` and the lockfile together, then run `npm ci`, `npm audit --audit-level=high`, tests, build, and `node --check server.js`.
