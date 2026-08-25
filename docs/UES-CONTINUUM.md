# UES Continuum — physics, VFX, navmesh, city, reference, motion, audio

CPU reference systems. They do not claim PhysX, GPU shaders, Recast/Detour, millions of agents, vision models or measured HRTF databases.

## Operational

- GJK intersection and EPA contact on spheres/convex hulls, sleeping islands, conservative sampled rotational sweep.
- Stable Fluids 2D density/velocity with projection, buoyancy smoke and a measured performance gate.
- Voxel occupancy from a 3D room mesh, ground-layer walkable extraction, A* corridor and funnel string-pulling.
- City district Voronoi, 96-agent census sample, hour schedules and D-O15 dormant/statistical LOD.
- Structured reference cards → proportion/palette/silhouette constraints and license rights policy. No vision.
- Feature-space motion matching with a legal clip graph.
- ITD/ILD stereo spatialization and loop-seam crossfade residual.

`POST /api/v1/ues/continuum/build` writes a verified `production.ues-continuum` artifact.

## Individual endpoints

- `POST /api/v1/ues/physics/convex`
- `POST /api/v1/ues/vfx/simulate`
- `POST /api/v1/ues/navmesh/compile`
- `POST /api/v1/ues/city/simulate`
- `POST /api/v1/ues/reference/compile`
