# UES shared kernel — generation 1

Every new UES system reuses this chain:

```text
knowledge → thesis → module → represent → D-O15 → execute → verify → refine
```

This is not a stack of isolated features. World, geometry, physics, NPCs, materials, particles, audio and graphics all share:

- Tese dos D evaluation
- adaptive representation (`full / simplified / dormant / reconstructable / procedural / instanced`)
- D-O15 quality frontier
- artifact verification and rollback

Low-level APIs (Vulkan, DirectX, OpenGL, Metal) are optional backends. They do not replace the UES graphics layer.

`POST /api/v1/ues/close/build` runs the shared close chain.

`POST /api/v1/ues/atelier/build` continues the same kernel with constructive solids, Featherstone dynamics, remote studio, mesh nav, hierarchical lives and consensus receipts. See [UES-ATELIER.md](./UES-ATELIER.md).
