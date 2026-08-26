# External Job Provider Adapter

The adapter pre-finalizes external 3D, build, rendering, GPU and similar job providers without pretending they are connected.

## Protocol

A configured provider exposes:

```text
GET  /health
POST /jobs
GET  /jobs/:id
GET  artifact URLs on the same configured origin
```

The SNB adapter implements environment-based credentials, capability checks, health probe, bounded retry, timeout, polling, same-origin artifact enforcement, 100 MB Beta limit, optional provider checksum comparison, SNB SHA-256, file storage, Artifact Graph registration, license metadata and a client/backend receipt that remains `providerAttested: false` unless a future provider supplies cryptographic attestation.

## Configuration

Copy `docs/providers.example.json` to the ignored configured path (default `data/providers.json`) and provide tokens only via environment variables referenced by `tokenEnv`.

```env
EXTERNAL_PROVIDER_CONFIG=./data/providers.json
MY_3D_PROVIDER_TOKEN=secret-not-in-git
```

## APIs

```text
GET  /api/v1/external-providers
GET  /api/v1/external-providers/:id/health
POST /api/v1/external-providers/execute
```

The integration is operational and tested against an actual local HTTP test provider. Production capability remains external-dependency until a real endpoint executes and returns a verified artifact.
