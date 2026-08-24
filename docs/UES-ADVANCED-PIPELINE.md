# UES Advanced Internal Production Pipeline

The advanced pipeline is UES-owned and executes without 3D, rigging, animation, physics, VFX or world-generation services.

## Executed production chain

```text
prompt → semantic identity/part hierarchy → parametric part geometry
→ topology inspection → advanced deterministic CPU physics
→ FK + iterative IK + retargeting → multi-LOD generation
→ specialized critics → verified artifact
```

`POST /api/v1/ues/advanced/build` writes an `application/vnd.snb.ues-advanced+json` artifact. The UES Stage exposes this as **Advanced**.

Implemented physics includes sweep-and-prune broadphase, AABB narrowphase, positional correction, normal impulses, friction, restitution, quaternion angular integration, fixed-step gravity, distance joints, triggers and slab raycasts. Animation includes hierarchy FK, iterative constrained-length IK and normalized name-map retargeting. Semantic 3D includes editable parts, hierarchy, relations, functions, materials, parametric ellipsoid geometry and per-part vertex ranges. Optimization produces multiple LOD levels. Topology, physics, animation, performance and consistency critics determine artifact verification.

## Honest boundary

This is substantially beyond a baseline, but does not claim arbitrary photorealistic generation. Convex/GJK narrowphase, continuous collision, solver islands, anatomy inferred from arbitrary references, production skin deformation, foot locking, motion blending, GPU rendering and perceptual image metrics remain implementation work inside the UES.
