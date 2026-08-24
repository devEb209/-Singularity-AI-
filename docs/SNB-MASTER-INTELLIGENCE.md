# SNB Master Intelligence Fabric — V1 Core

The Master Intelligence compiler is the first executable integration layer for the 30 SNB cognitive programs. It does not claim that each long-term research program is complete.

## API

```text
GET  /api/v1/master-intelligence/programs
POST /api/v1/master-intelligence/compile
```

Compilation requires an owned project and produces both:

1. a persistent mission DAG;
2. a checksummed `plan.snb-cognitive-program` artifact.

## Executed flow

```text
intent reconstruction
→ domain/complexity analysis
→ scoped context retrieval and compression
→ dynamic temporary specialist genesis
→ three parallel execution realities
→ risk/failure prediction
→ contradiction scan
→ cross-domain hypotheses
→ experiment contract
→ critic preflight
→ mission DAG
→ decision memory
→ cognitive artifact
```

The output explicitly remains `compiled-awaiting-workers`; compiling is not represented as specialist/model execution.

## Mission structure

The generated DAG includes intent validation, independent evidence, scenario simulation, mission-scoped specialists, critic matrix, correction, artifact integration, final verification and delivery. High-impact requests receive an approval task. Specialist contracts define capabilities, tools, permissions, attempt/context budgets and artifact requirements.

Workflows can now be mutated transactionally through `POST /api/v1/missions/:id/mutate`. A mutation can cancel pending tasks and add a revised subgraph in one SQLite transaction. The combined graph is validated for duplicate keys, missing dependencies, cycles and the 200-task limit before any write; closed missions and non-pending cancellation targets are rejected. Every accepted mutation moves the contract to `REPLANNING`, recalculates progress and records a `mission.workflow_mutated` event.

## Cognitive programs

The canonical runtime registry contains exactly 30 programs. Each reports one of:

- `operational-core`: the documented V1 core executes and has evidence;
- `foundation`: supporting primitives and integration contracts execute, but advanced autonomous behavior remains;
- `research-program`: only bounded, controlled experimental behavior is allowed.

This scoped vocabulary prevents a working compiler stage from being misrepresented as completion of an open-ended research ambition.

## Specialist collaboration and independent review

Canonical Puter model outputs can be recorded through `POST /api/v1/master-intelligence/handoffs`. The route accepts only a running `specialist:*` task, an exact available canonical model key and project-scoped input artifacts. It persists the output/findings, emits an HMAC receipt and completes the specialist task with an explicit `client-reported` trust boundary.

A running `critic:*` task can review a handoff through `POST /api/v1/master-intelligence/handoffs/:id/reviews`. The originating model cannot review itself; duplicate reviews from the same model are rejected. Reviews persist `accept`, `revise` or `reject`, structured findings and a separate receipt. This is real collaboration state, but not provider attestation.

## Verification and safety

A cognitive artifact is rejected when blocking contradictions exist. The compiler records assumptions rather than silently guessing, preserves original memories, stores a bounded context digest, predicts failure classes, inserts security review for high-impact work and never claims provider execution. The Emergent Intelligence Laboratory produces hypotheses and metrics only; it does not self-modify the platform.
