# SNB Local Beta Release Candidate Checklist

## Automated gate

```bash
npm run beta:check
```

This runs lint, all tests, frontend/backend TypeScript checks, production build and production-dependency audit.

## Runtime gate

`GET /api/v1/beta/readiness` reports:

- API health
- exact 879-model catalog
- worker freshness
- physical-execution feature gate
- secret hardening warnings

Current expected local status is `local-beta`; default development secrets intentionally prevent `release-candidate` status for public exposure.

## Newly operational Beta surfaces

- Persistent non-guest e-mail/password sessions and refresh rotation
- Single-use local-Beta password recovery
- Secure generated `.env` secrets and strict production startup validation
- Restricted CORS and security-header verification
- Validation-only JavaScript/TypeScript/JSON sandbox
- Online database/upload backups with SHA-256 verification
- Persistent approvals and one-time consumption
- Medium-risk Tool Policy enforcement
- Evidence sources, claims and links
- Unknown/conflicting claim states
- Persistent user preferences
- Portable JSON data export
- Real projects, files, conversations, missions, memory and audit UI
- Global frontend Error Boundary

## Must change before sharing beyond a trusted local Beta

1. Replace every development secret with independent random values
2. Configure a non-wildcard CORS origin
3. Use HTTPS at the edge
4. Add verified account flow instead of guest-only continuity
5. Back up `data/singularity.db` and uploaded files
6. Label visual-only labs as unavailable until providers exist
7. Run browser E2E tests on the deployment URL
8. Review privacy/retention settings and provide deletion workflow

Physical execution remains disabled and billing remains absent.
