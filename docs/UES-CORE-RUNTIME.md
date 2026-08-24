# UES Core Runtime V1

The UES now contains an owned, deterministic, lightweight runtime baseline. It executes locally in the SNB worker/API process and does not substitute providers for engine technology.

## Operational systems

`POST /api/v1/ues/core/build` executes and packages:

- seeded heightfield and biome world chunks;
- fixed-step rigid-body gravity and ground/AABB response;
- vertex-cluster retopology with compacted indices and degenerate-face verification;
- bounds-derived bone hierarchy and normalized per-vertex skin weights;
- procedural keyframes with monotonic timing and joint limits;
- bounded PCM waveform synthesis with peak, RMS, clipping and finiteness checks;
- NPC needs, goal selection, bounded memory and simulation ticks;
- deterministic particle-state VFX;
- dependency-safe resource deduplication with rollback when references would break.

The result is an `application/vnd.snb.ues-runtime+json` file and a verified `runtime.ues-core` Artifact Graph record containing the validation result of every subsystem.

The UES Stage exposes **UES Core**, which runs this pipeline against the selected real project.

## Boundaries

This closes the absence of an executable engine-owned baseline. It does not claim that the current implementation is a production photorealistic engine. Semantic world/nav/society sample, PCM mixing, CPU profiler/D-O15 and swept AABB live in [UES-LIVING-WORLD.md](./UES-LIVING-WORLD.md). Remaining advanced work includes arbitrary semantic geometry, anatomy inference, edge-flow retopology, convex physics, GPU VFX and city-scale inhabitation.

These are internal UES implementation gaps—not reasons to replace the UES with commercial generation APIs. Puter can provide specialist intelligence; generated decisions still need to be transformed and verified by UES-owned systems.
