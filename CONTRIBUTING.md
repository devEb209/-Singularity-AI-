# Contributing to SNB

Thank you for improving the Singularity Neural Bunker.

## Principles

1. Do not mark a capability operational without real execution and verification.
2. Preserve provider neutrality and tenant isolation.
3. Keep the client lightweight; heavy compute belongs in workers/providers.
4. Add tests for success, failure, authorization and artifact integrity.
5. Do not commit secrets, generated databases, uploads or provider credentials.
6. Respect third-party licenses and terms.

## Development

```bash
npm_config_nodedir=/usr/local npm install # nodedir only when native headers require it
npm run dev:api
npm run start:worker
npm run dev
npm run beta:check
```

Create focused commits, document capability status, and update `docs/V1-REMAINING-GAPS.md` only for genuine unresolved work. Pull requests should describe trust boundaries and external dependencies.
