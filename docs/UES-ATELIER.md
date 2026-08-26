# UES Atelier — generation 1 compete fabric

Shared continuation of the UES kernel. Every stage still follows:

```text
knowledge → thesis → module → represent → D-O15 → execute → verify → refine
```

This complement does **not** replace the Tese dos D.

| System | What it actually does | What it does not claim |
| --- | --- | --- |
| `ues-solid` | SDF CSG, loft, sweep, box UV | Learned image-to-3D |
| `ues-dynamics` | Analytic sphere/capsule CCD, yaw vertex-arc, Featherstone CRBA+RNEA planar serial | PhysX, full spatial branched ABA |
| `ues-studio` | Scene graph, inspector, timeline, undo/redo | AAA viewport / client engine |
| `ues-mesh-nav` | Voxel navmesh from arbitrary / CSG meshes | Recast/Detour |
| `ues-lives` | 1024 hierarchical persistent residents, climate/needs | Millions of unique full NMN minds |
| `snb-consensus` | Multi-round majority + HMAC integration receipt | Automatic Puter invocation |

`POST /api/v1/ues/atelier/build` runs the combined chain and persists `production.ues-atelier`.
