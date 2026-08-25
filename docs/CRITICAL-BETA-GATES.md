# Critical Beta Gates

## Implemented in this milestone

- Real e-mail/password registration and login UI
- Rotating refresh-token lifecycle in the frontend client
- Logout and current-session endpoint
- Single-use 15-minute password reset tokens
- Generic reset response to prevent account enumeration
- Local-development reset delivery only; production never returns the token
- `.env` loading and secure secret generator (0600, values never printed)
- Production startup refusal for default secrets, wildcard CORS or non-HTTPS public URL
- Restricted local CORS defaults and automated CORS/security-header tests
- Validation-only isolated workspace for JS syntax, TypeScript typecheck and JSON parse
- Static detection of process spawn, network, dynamic code, destructive filesystem and secret access
- No arbitrary untrusted code execution claim
- Online SQLite backup with SHA-256 manifest, verification and retention
- Playwright E2E specification for shell, project persistence, tool verification and navigation errors

## External/environment blockers

### HTTPS

The application enforces HTTPS configuration in production, but TLS termination requires a deployment domain/reverse proxy. It cannot be made publicly operational inside source code alone.

### Password-reset delivery

Production reset delivery requires an e-mail provider. The backend creates secure one-time tokens but never exposes them in production. Local Beta exposes a token only to complete the development flow.

### Puter account attestation

Puter login works directly in the browser. The backend still labels execution as client-reported because no verified Puter account/execution attestation has been configured.

### Web search

Evidence storage is operational. Automatic search requires a legitimate search/provider adapter and terms-compliant credentials. No source is invented when no provider exists.

### Browser binary in this sandbox

Playwright tests are committed, but Chromium download failed repeatedly with `ECONNRESET` from the external CDN. Run `npm run e2e:install && npm run e2e` in CI or a connected development machine. The failure is environmental and is not counted as a passed test.

## Sandbox boundary

The current Beta sandbox validates/compiles but does not execute untrusted user code. This is deliberate: the runtime lacks a proven network namespace/cgroup/container boundary. Claiming arbitrary execution would be unsafe. Production execution requires container/microVM isolation with no network by default.
