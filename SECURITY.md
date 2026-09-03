# Security Baseline

This project is a public church website with an administrator application, public media, livestream and public comments.

## Current controls

- HTTPS/HSTS is enforced in production by the application response headers.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` are sent by the application.
- A CSP is enforced as a compatibility policy; it currently permits inline scripts/styles because the legacy/static pages still contain inline code. The next hardening phase should move inline code to external files or nonced/hash-based scripts.
- Production session cookies use `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, and a `__Host-` cookie name.
- State-changing API requests require a same-origin `Origin` header and are rate limited. This is an origin-based CSRF defense; a synchronizer/cookie-to-header CSRF token should be added if cross-origin integrations are introduced.
- Administrator login and public comment posting have dedicated rate limits in addition to a general unsafe-request limit.
- Admin RBAC checks permissions server-side before privileged operations.
- Public comment fields, media metadata and IDs are length/type constrained.
- Media uploads use an allowlist, a 50 MB size limit, generated storage names and basic file-signature validation.
- SQL access in the SQLite path uses parameterized statements.
- API responses are marked `Cache-Control: no-store`.
- A public privacy page is available at `/privacy.html` and should be reviewed against the Church's actual data practices and applicable Kenyan law.

## Remaining hardening work

1. Replace the default Express session memory store with a persistent, dedicated production session store before scaling to multiple instances.
2. Add a real CSRF token for state-changing authenticated operations as a defense-in-depth measure.
3. Remove `unsafe-inline` from CSP by moving inline scripts/styles to external assets or using nonces/hashes.
4. Add malware/antivirus scanning for uploaded media and consider image rewriting/CDR for document formats.
5. Keep public storage access limited to intentionally public media; sensitive files should use private storage and authorization/signed URLs.
6. Add MFA for Super Admin accounts.
7. Add automated dependency, secret, SAST and DAST checks to CI.
8. Add structured security logging and alerts for repeated authentication failures, upload abuse and permission failures.
9. Review Supabase RLS policies independently of the service-role backend.
10. Review all admin-controlled URLs before allowing additional third-party destinations.

## Reporting

Do not publish credentials, activation codes, private URLs or exploitable details in public issues. Report suspected vulnerabilities privately to the site owner/maintainer.
