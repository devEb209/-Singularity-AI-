# Singularity 150-System Registry

The 150 systems defined by the project owner are registered in `server/services/system-registry.ts` with stable numeric IDs, domain, and honest implementation status.

## Status meanings

- `planned`: requirement is registered but implementation has not started;
- `foundation`: contracts or supporting infrastructure exist, but the full promised system does not;
- `operational`: an end-to-end V1 capability exists and is tested.

No system becomes operational merely because a frontend panel exists.

## API

```text
GET /api/v1/systems
GET /api/v1/systems?status=foundation
GET /api/v1/systems?domain=Memória,%20modelos%20e%20fallback
```

Responses include the complete registry summary. This allows Mission Control and future clients to render the roadmap from one canonical source.

## Transversal architecture

The systems are not intended to become 150 isolated services. They are composed over shared primitives:

- Identity and permissions
- Project and workspace isolation
- Event log and audit
- Model and provider registry
- Task DAG and persistent jobs
- Tool registry and sandbox execution
- Context and memory fabric
- Artifact and file registry
- Evidence and verification
- Checkpoints and rollback
- Metrics, benchmarks and routing

This keeps Full Game Genesis, Software Factory, Research Civilization and the final Intelligence Fabric interoperable.

## Honest current state

Operational V1 foundations include the Singularity API, persistent files, the provider adapter boundary and the canonical model registry. Authentication, memory, projects, routing, fallback, streaming, audit and dynamic tiers are foundations still requiring the larger distributed and multimodal stages.

Billing is intentionally absent and remains the last product system to be implemented.
