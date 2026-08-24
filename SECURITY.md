# Security Policy

## Supported version

The current V1 Beta branch receives security fixes. Experimental physical execution remains disabled.

## Reporting

Do not open public issues containing credentials, personal data or exploit details. Use GitHub's private vulnerability reporting for this repository when enabled, or contact the repository owner through a private verified channel.

Include the affected route/component, impact, minimal reproduction and suggested mitigation. Never include real third-party tokens.

## Boundaries

- Secrets belong in `.env` or a secret manager and are excluded from Git.
- External providers are allowlisted by server-side configuration.
- Untrusted code is validated but not arbitrarily executed without container/microVM isolation.
- Physical execution is feature-gated and not operational.
- Client-reported Puter receipts are not provider attestation.
- Responsible testing must use systems you own or are explicitly authorized to test.

Run `npm run beta:check` before reporting regressions.
