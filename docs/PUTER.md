# Puter.js Integration

## Truthful status

Puter.js is integrated as a browser-side User-Pays gateway and the backend now contains a canonical catalog, evaluation records and capability-specific routing. No Puter model is hardcoded into production routing.

The canonical `puter-models.txt` snapshot was retrieved from the repository link supplied by the project owner and validated on 2026-08-22. It declares **879 models**, all 879 were parsed, and all 879 unique `provider + id` pairs were imported. Snapshot SHA-256: `a5f094fce2d46901feaa8c6957adc3756a858011e4b0da8e7d8753d6a35b92e2`.

## Official discovery source

The browser calls only the official APIs:

```ts
await puter.ai.listModelProviders()
await puter.ai.listModels()
```

The returned `id` and `provider` are preserved exactly. `PuterGateway.chat()` refuses any pair that was not returned by `listModels()` in the current browser session.

References:

- https://docs.puter.com/AI/listModels/
- https://docs.puter.com/AI/listModelProviders/
- https://docs.puter.com/AI/chat/
- https://docs.puter.com/supported-platforms/

Puter.js is loaded on demand from the official `https://js.puter.com/v2/` script. The npm SDK was deliberately not retained because its dependency tree produced unresolved security advisories during verification.

## Importing the supplied snapshot

Accepted formats:

1. the `PUTER AI — MODEL REGISTRY` export used by this project;
2. JSON array of model objects;
3. `{ "models": [...] }`;
4. NDJSON, one complete model object per line.

Every item must include exact `id` and `provider` fields from the extraction script. Plain guessed names are rejected.

```bash
npm run models:import -- puter-models.txt
```

The importer:

- never creates model names;
- deduplicates exact `provider + id` pairs;
- stores all original metadata as JSON;
- records first and last seen timestamps;
- marks models missing from a newer complete snapshot as unavailable instead of deleting history;
- generates a SHA-256 hash of the sorted snapshot;
- runs transactionally in SQLite.

## Canonical identity

```text
puter:{provider}:{exact-model-id}
```

Aliases are metadata and never silently replace the canonical ID. This prevents collisions where two providers expose similar names.

## “Use all models”

All models in a valid snapshot are registered and remain eligible for evaluation. This does **not** mean executing 800+ models for every prompt. Doing so would be slow, expensive, wasteful and contrary to legitimate quotas.

Instead:

1. every exact model is catalogued;
2. explicit capability metadata is retained;
3. benchmark jobs evaluate models per capability;
4. the Router selects a small ranked candidate pool for the current task;
5. fallback walks that pool only when required;
6. periodic evaluation allows previously weak or new models to move tiers.

Thus every model can serve the function where measured evidence shows it performs best.

## Tier policy

A model begins as `UNRANKED`. Price, context window, provider marketing and model name do not create a quality tier.

A capability requires at least three benchmark observations before receiving a tier. Rankings are independent for:

- chat;
- reasoning;
- code;
- research;
- vision;
- creative work;
- planning.

The normalized score is adjusted by observed success rate:

```text
adjusted score = average successful benchmark score × success rate
```

Current thresholds:

| Tier | Adjusted score |
|---|---:|
| S++ | 95–100 |
| S+ | 90–94.99 |
| S | 82–89.99 |
| A+ | 74–81.99 |
| A | 66–73.99 |
| B | 55–65.99 |
| C | below 55 |
| UNRANKED | fewer than 3 observations |

Confidence rises with evidence volume and reaches 100% at twenty observations. Latency is tracked separately and used as a tie-breaker, not confused with quality.

These thresholds are an operational policy, not a claim of universal intelligence.

## Fallback, retry and rollback

These are separate mechanisms:

### Fallback

If candidate 1 fails, times out, is unavailable or rejects the input, the orchestrator tries candidate 2 from the same capability-ranked pool. Every failure is recorded.

### Retry

A retry repeats the same operation only for a transient, retry-safe failure. It must use bounded exponential backoff and never bypass Puter quotas.

### Rollback

Rollback restores application state to the checkpoint before an agent operation. It does not manipulate a provider quota. Project mutations, files and artifacts will use transaction/checkpoint records before autonomous tools are allowed to change them.

### Circuit breaker

A model/provider with repeated recent failures is temporarily removed from routing. It can re-enter after a cooldown and health probe. Persistent circuit-breaker metrics are part of the next provider-observability stage.

## Security

Canonical catalog synchronization is not open to arbitrary browser users. The admin endpoint requires an independent `MODEL_SYNC_SECRET` compared in constant time. This prevents a malicious client from submitting invented IDs and poisoning the router.

The Puter user authenticates directly with Puter in the browser. Their Puter credentials are not sent to the Singularity backend.

## Beta chat execution

The chat UI can now run a real Puter call after direct user authentication. Until trusted benchmarks produce ranked candidates, the Beta policy rotates across exact text-capable IDs returned by live discovery and tries at most three candidates. It labels the policy `exact-catalog-round-robin-unranked-beta`; it does not call this quality routing.

Successful output is reported to the SNB backend for conversation persistence. The backend validates the exact provider/model against the canonical 879-model catalog, hashes prompt/response, records fallback, and signs its own report. Trust remains `client-reported`, `providerAttested: false`, and `not-verified`, because the browser report is not cryptographic proof from Puter.

## Endpoints

```text
GET  /api/v1/models/puter
GET  /api/v1/models/puter/route/:capability
POST /api/v1/admin/models/puter/sync
POST /api/v1/admin/models/evaluations
GET  /api/v1/puter/executions
POST /api/v1/puter/executions
```

The two admin endpoints require `x-model-sync-secret`.
