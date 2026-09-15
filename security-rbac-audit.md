# RBAC API Security Audit

## Scope

This branch is for hardening legacy administrative API boundaries so authorization is enforced server-side rather than only by the admin UI.

## Rules

- Public/read-only endpoints remain public where intended.
- Administrative mutations must require an authenticated administrator session.
- Sensitive mutations must additionally require the matching granular permission.
- Super Admin remains the only role allowed to manage administrator roles/permissions and protected Church Identity data.
- The frontend must never be treated as the authorization boundary.

## Verified boundary

`admin_access_requests` is server-mediated through the Render API. Its database table is now protected by RLS and is not intended for direct browser access.

## Legacy boundary under review

`events-api.js` uses a generic `requireAdmin` guard for administrative event mutations. This must be replaced or augmented with a granular event/content permission check before granting non-Super-Admin users event-management capability.

## Implementation note

Do not introduce a permissive `authenticated` RLS policy for sensitive admin tables. The Render service role remains the controlled database access path.
