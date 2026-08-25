# Universal Capability Fabric

The source specification is preserved in `PROMPT UNIVERSAL AI.TXT`.

## Purpose

SNB is not limited to Puter models. Models, APIs, SDKs, plugins, libraries, CLIs, desktop/web software, engines, services, scripts and future devices can become capabilities through a common manifest and policy boundary.

## Manifest lifecycle

```text
discovered → testing → active
discovered/testing → unavailable/disabled
```

A newly registered manifest cannot start active. Activation requires a non-`UNVERIFIED` license and at least three evidence records. Reliability is measured independently of marketing.

## Environment discovery

The Beta checks only a fixed safe executable allowlist (`python3`, `ffmpeg`, `blender`, `godot`) using version commands. A detected executable enters `testing`; absence becomes a capability gap. Discovery does not authorize execution or claim that an adapter exists.

## 3D/animation solution

Because the Puter snapshot has no proven native 3D/animation generation pool, SNB synthesizes an external-tool pipeline:

```text
research → concept → 3D generation → retopology → UV → PBR
→ rig → animation → optimization → export → deterministic validation
```

Every stage must resolve to an active, licensed, benchmarked capability manifest. Otherwise the pipeline is returned as non-executable with explicit gaps. The current sandbox detected no Blender/Godot/FFmpeg executable, so SNB does not fake a model, mesh or animation.

External services can later be registered through provider-neutral manifests and adapters. API keys remain server-side, and each adapter still requires policy, receipt, verifier, timeout, health and fallback.

## APIs

```text
GET  /api/v1/capability-fabric
POST /api/v1/capability-fabric/pipeline/3d
POST /api/v1/admin/capability-fabric/discover
POST /api/v1/admin/capability-fabric/manifests
POST /api/v1/admin/capability-fabric/manifests/:id/validate
```
