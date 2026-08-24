# UES Living World — semantic world, navigation, society, audio, profiler

Internal CPU reference systems. They do not import GIS, do not claim photoreal cities, do not claim a full city census of NPCs, and do not use a GPU.

## Operational

- Semantic world: heightfield, biomes, slope, A* road graph between settlements, building lots, biome vegetation, chunk streaming.
- Navigation: walkable grid, A*, deterministic local avoidance, NMN action → destination.
- Society: 24-agent population sample, resource prices from scarcity, D-O15 fidelity (distant agents stay dormant).
- Audio mixer: PCM mix, spatial gain, event sync, loudness gate. No codecs.
- Profiler: `process.hrtime.bigint()` CPU sections. `gpu:false`.
- D-O15 loop: cheaper perceptual equivalent + rollback if the quality frontier is crossed.
- Physics: swept AABB CCD + solver islands. Not GJK/convex.
- Motion: foot lock on descent + Hermite blend.

`POST /api/v1/ues/living-world/build` packages the systems into one verified `runtime.ues-living-world` artifact.
