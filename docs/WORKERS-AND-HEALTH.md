# Persistent Workers and Model Health

## Worker architecture

Long-running mission execution is separate from the HTTP API:

```text
Mission Engine → durable SQLite queue → atomic claim → worker lease → tool execution → deterministic verifier → signed receipt → task completion
```

Run locally:

```bash
npm run start:worker
```

The initial worker advertises only the `tool` capability and executes task kinds in the form `tool:<exact-tool-id>`. It cannot claim unrelated research, model or physical tasks.

## Leases and heartbeats

- Claims are serialized in a SQLite transaction.
- Dependencies must be completed before a task can be claimed.
- A random lease token is stored only as SHA-256.
- Default lease duration is 30 seconds.
- Workers renew leases with heartbeats.
- Expired leases return to `pending` while attempts remain.
- The task and mission fail after bounded attempts.
- Workers can enter `draining` and stop accepting work.

## Crash-boundary idempotency

If a worker completes a deterministic tool but crashes before updating the mission, the next worker checks for a completed execution with the same task ID. It reuses the signed result instead of executing the side effect again.

## Internal worker API

The distributed-worker endpoints require an independent `x-worker-secret`:

```text
POST /api/internal/workers/register
POST /api/internal/workers/:id/heartbeat
POST /api/internal/workers/:id/claim
POST /api/internal/workers/:id/renew
POST /api/internal/workers/:id/drain
POST /api/internal/workers/recover-expired
```

Worker status is available only to the protected admin route:

```text
GET /api/v1/admin/workers
```

## Model health

Every health sample records exact canonical model key, outcome, latency, source, error and timestamp. Sources are execution, health probe or benchmark.

Five consecutive failures open the model circuit for two minutes. Open models are excluded from capability routing. After cooldown, the model becomes half-open for a probe. A successful trusted probe closes the circuit.

Metrics include:

- sample count;
- success rate;
- average latency;
- p95 latency;
- consecutive failures;
- circuit state;
- cooldown;
- last error.

No health event changes a quality tier; health and benchmark quality are independent dimensions.
