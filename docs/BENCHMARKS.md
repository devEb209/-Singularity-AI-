# Model Benchmark Civilization

## Purpose

All 879 exact Puter models remain in the evaluation universe. Benchmark campaigns determine where each model performs well; names, providers, prices and context windows never create quality tiers.

## Eligibility

For text capabilities, all 879 catalog entries can be queued. Models with explicit text metadata are eligible from that metadata; entries without modality metadata are eligible from the Puter chat-catalog contract and must prove success during execution. This is eligibility to test, not a quality claim.

Current campaign coverage:

| Capability | Eligible | Explicit/contract notes |
|---|---:|---|
| Chat | 879 | all catalog models |
| Reasoning | 879 | all tested; no assumed strength |
| Code | 879 | all tested; no assumed strength |
| Research | 879 | all tested; no assumed strength |
| Creative | 879 | all tested; no assumed strength |
| Planning | 879 | all tested; no assumed strength |
| Vision | 103 | explicit image/video input metadata only |

For vision, 724 entries lacking modality metadata are not guessed to support images. Future live discovery may fill that metadata and make them eligible.

## Versioned suites

The initial public-canary suites are:

- `chat-v1`
- `reasoning-v1`
- `code-v1`
- `research-v1`
- `vision-v1`
- `creative-v1`
- `planning-v1`

Each suite declares cases, modality, criteria and scoring strategy. Production requires protected holdouts in addition to these canaries.

## Persistent campaign flow

```text
Create campaign
  → one job per exact eligible provider/model pair
  → client claims one job with a 10-minute lease
  → backend issues a random 384-bit receipt
  → client executes only the exact pair through Puter
  → client submits output + latency + receipt
  → output is marked UNTRUSTED / awaiting evaluation
  → trusted evaluator verifies result
  → evaluation evidence is recorded
  → capability tier may change only after minimum evidence
```

Expired claims return to the pending queue. Campaigns support running, paused, completed and cancelled states.

## Anti-forgery boundary

The claim receipt is stored only as SHA-256 and compared in constant time. It prevents accidental/wrong-job submission, but a browser user can still fabricate model output. Therefore:

- client submissions never directly affect tiers;
- a submitted job is not a verified job;
- only the protected verification endpoint can create evaluation evidence;
- one verified campaign still leaves a model `UNRANKED` because at least three independent observations are required.

## APIs

```text
GET   /api/v1/benchmarks/suites
GET   /api/v1/benchmarks/campaigns
POST  /api/v1/benchmarks/campaigns
GET   /api/v1/benchmarks/campaigns/:id
PATCH /api/v1/benchmarks/campaigns/:id
POST  /api/v1/benchmarks/campaigns/:id/claim
POST  /api/v1/benchmarks/jobs/:id/submit
POST  /api/v1/admin/benchmarks/jobs/:id/verify
```

The final endpoint requires the independent model synchronization/admin secret.

## Browser runner

The Model Router can now create a `code-v1` campaign and, only after a separate user click, execute one leased job through `PuterGateway.chat()`. The runner signs in directly with Puter, refreshes official discovery, refuses IDs absent from that discovery, executes every case in the suite and submits the receipt. It never starts hundreds of User-Pays calls silently.

## What remains

- Protected holdout datasets
- Trusted deterministic and model evaluators
- Media fixtures for vision
- Quota/consent screen before starting 879 calls
- Worker concurrency and resumable batches
- Statistical confidence intervals
- Contamination detection
- Repeated campaigns across model/provider changes
- Agent/workflow benchmarks beyond raw models
