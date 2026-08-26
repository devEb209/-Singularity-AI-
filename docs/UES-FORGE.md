# UES Forge — corpus, critics, constraints, regression, streaming

CPU reference systems. They do not claim specialist-derived arbitrary 3D, scanned anatomy, Featherstone solvers, GPU renderer regression or GIS streaming.

## Operational

- Six-kind semantic catalog (humanoid, quadruped, vehicle, chair, tree, crate) with parent graphs and parametric meshes.
- Geometry critics: signed volume, skinny triangles, neighbor winding, triangle-triangle intersections.
- Anatomy critics: contralateral length symmetry and head-to-height canon on the template.
- Particle Gauss-Seidel: distance, planar hinge and damped spring. Energy falls with damping.
- Gray-raster PSNR/SSIM compare with D-O15 rollback when the corrupt raster fails the frontier.
- Chunk residency with load/unload hysteresis and a hard resident budget.

`POST /api/v1/ues/forge/build` writes a verified `production.ues-forge` artifact.

## Individual endpoints

- `POST /api/v1/ues/corpus/compile`
- `POST /api/v1/ues/critic/compile`
- `POST /api/v1/ues/constraints/simulate`
- `POST /api/v1/ues/regress/compare`
- `POST /api/v1/ues/stream/compile`
