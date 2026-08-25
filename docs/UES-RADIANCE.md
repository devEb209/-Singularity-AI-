# UES Radiance

Complement to the Tese dos D and to [UES-GENESIS.md](./UES-GENESIS.md). It does **not** replace them.

```text
G-buffer → Cook-Torrance RGB → lights → ortho PCF shadow → analytical IBL → ACES + bloom
```

This is the UES **own** executing graphics path. External engines (Unreal, Unity, Godot) and hardware APIs (WebGPU, Vulkan, DX12, Metal) are optional amplifiers, not the capability.

## What actually runs

| Module | Operational now | Honest limit |
| --- | --- | --- |
| `ues-light` | Cook-Torrance RGB, directional/point/spot, F0 metal/dielectric split | Not Lumen, not path tracing |
| `ues-texture` | Bilinear + mip chain on procedural maps | Not GPU anisotropic / 16K store |
| `ues-shadow` | Ortho depth map + 3×3 PCF | Not virtual shadow maps |
| `ues-gbuffer` | Albedo/normal/world/material with depth test | Not hardware MRT |
| `ues-atmosphere` | Analytical sky + sun disc | Not measured Hosek-Wilkie / NASA |
| `ues-post` | ACES filmic + bloom | Not TSR / DLSS |
| `ues-radiance` | 48×32 deterministic PBR frame, metal ≠ plastic | Not Nanite, not a shipped 4K game frame |
| `ues-gpu/webgpu` | `requestAdapter` path exists | Sandbox has no device |

## What this is not

- Not better than Unreal.
- Not better than any current shipped game.
- Not Nanite, Lumen, hardware RT, Niagara GPU, or Virtual Shadow Maps.
- Not a CPU API merely *named* GPU: the fallback **executes** fragments, lighting and shadows; hardware still remains the presentation goal.

`beatsUnreal: false` and `beatsAnyCurrentGame: false` are part of the verified artifact.

```text
POST /api/v1/ues/radiance/build
POST /api/v1/ues/light/compile
POST /api/v1/ues/texture/compile
POST /api/v1/ues/shadow/compile
POST /api/v1/ues/post/compile
```
