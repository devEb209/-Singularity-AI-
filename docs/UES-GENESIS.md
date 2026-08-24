# UES V1 Gênesis

Complement to the Tese dos D. It does **not** replace existing systems.

```text
intent + knowledge + data + Tese dos D + IA + rules + budget
→ games / worlds / simulations / systems / interactive experiences
```

V1 Gênesis is the first **complete competitive generation**. V2 exists to surpass it.

## What this batch actually runs

| Module | Operational now | Honest limit |
| --- | --- | --- |
| `ues-raster` | Real barycentric raster + depth + deterministic pixels | Hardware WebGPU device |
| `ues-gpu` | Own GPU API + compute + raster fallback that **executes** | WebGPU/Vulkan adapters |
| `ues-shader` | Material graph → IR → DCE/fold → WGSL/GLSL + CPU eval | Not DXC/SPIR-V |
| `ues-render` | 9-pass render graph + last-use | Not clustered lighting |
| `ues-shader` | IR + bytecode + cache + WGSL emit | Hardware compiler (DXC/SPIR-V) |
| `ues-image3d` | Silhouette, distance, symmetry, loft, CSG, multi-view internal | Learned vision |
| `ues-fnws` | Dormant / aggregate / shallow / detailed + wind/objects | GPU SPH |
| `ues-scale-policy` | Needed × representation × D-O15 | Fixed 320/1e6 dogma removed |
| `ues-world-knowledge` | Elevation/climate/soil/hydro → biome; alien laws | Live NASA Earth |
| `snb-orchestrator` | Auto-runs internal solid/semantic/image3d | Puter = canonical pending ticket |
| `ues-population` | Hierarchical cognition, not a conceptual cap | Unique full minds at any count |
| `ues-spatial` | Synthetic + local HLOD normalize | Google/NASA/OGC adapters |
| `snb-toolbox` | Official/community lanes + canon layers | Not a live store |
| `ues-genesis` | Combined verified artifact | Instant AAA still false |

`POST /api/v1/ues/genesis/build` is the close chain for this generation slice.
