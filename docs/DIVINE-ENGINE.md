# Divine Engine Architecture

## Boundary

SNB remains the intelligence platform. Divine Engine is a specialized remote-first creation environment inside SNB; it is not a traditional engine installed on the user device.

```text
User device = intent, control, lightweight editing, streamed preview
SNB = intelligence, planning, routing, memory, policy and verification
Divine Engine = persistent production graph and artifact assembly
Remote/external compute = heavy generation, rendering, builds and simulation
```

## Real project creation

Creating a Divine project now persists:

- standard SNB project
- `snb-divine-project-v1` metadata
- mission contract
- 14 Domain Boss tasks and dependencies
- target platform
- execution policy
- detected device profile
- real artifact list
- capability-gap report

Bosses are Master AI, Game Director, Engine, World, Gameplay, 3D, Texture, Animation, Audio, NPC, Integration, Optimization, Quality and Build.

## Device-independent UI

The frontend detects only coarse non-sensitive capabilities: viewport, logical cores, optional device memory, network hint and save-data preference. It assigns low/balanced/high presentation tiers. Low devices use thumbnail/480p streamed-preview policy and avoid a heavy viewport. Intelligence is unchanged.

## No fake construction

Progress comes from persisted mission tasks. Artifact count comes from stored files. If no 3D provider/adapter is active, the project is `blocked`, progress stays 0 and capability gaps are visible. No animated fake progress or nonexistent asset is shown.

## External capability path

Heavy stages resolve through Universal Capability Fabric. A real 3D/animation Beta requires active manifests for generation, retopology, UV, PBR, rigging, motion, optimization, export and validation. Each needs license, evidence, adapter, policy, health and verifier.

## APIs

```text
GET  /api/v1/divine-engine/projects
POST /api/v1/divine-engine/projects
GET  /api/v1/divine-engine/projects/:id
```

## First real 3D artifact provider

The Beta includes `snb.procedural-3d`, a deterministic local fallback that writes a real GLB 2.0 file with indexed mesh, normals, UV coordinates, PBR metallic/roughness material and a turntable quaternion animation. The artifact is stored through the normal file system with SHA-256 and independently parsed after generation.

It is deliberately limited to a 24-vertex/12-triangle cube whose name and material color are derived from the prompt. It is not described as semantic text-to-3D, character generation, retopology or rigging. It proves the execution → artifact → verification path while external advanced providers remain capability gaps.

## Real lightweight prototype pipeline

The internal fallback can now execute a complete small pipeline: procedural GLB → six PNG PBR maps → material manifest → scene manifest → self-contained offline WebGL build → artifact dependency graph. This produces ten verified artifacts with no external library or network dependency. It is intentionally a primitive proof pipeline, not an AAA game claim.

All generated textures are capped at 64×64 by the low-device prototype and generally remain under 10 KB each. Heavy future providers run remotely; the user device receives progressive artifacts and previews.

## Deliberately deferred

SNB Super Resolution, FrameFlow, renderer, physics runtime, world streaming runtime and physical compute providers are architecture targets, not current operational claims. They must be implemented as remote capabilities/artifacts and benchmarked before activation.
