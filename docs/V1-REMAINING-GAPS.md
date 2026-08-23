# V1 Remaining Gaps Only

This registry intentionally excludes completed capabilities. Canonical API:

```text
GET /api/v1/v1-gaps
GET /api/v1/v1-gaps?area=UES
GET /api/v1/v1-gaps?area=DsOS
GET /api/v1/v1-gaps?area=SNB%20Infrastructure
```

Statuses are limited to `PARTIAL`, `ADAPTER_REQUIRED`, `INFRASTRUCTURE_REQUIRED`, `BLOCKED`, and `PLANNED`. No `ACTIVE` record is permitted in this list.

Major remaining UES gaps are advanced semantic 3D, edge-flow retopology, anatomy-aware rigging/motion, advanced world/physics/NPC/audio/VFX/multiplayer runtimes, target engine builds, GPU workers and profiler-driven optimization. The verified UES-owned lightweight core now executes world chunks, fixed-step physics, normalized skin weights, animation keyframes, NPC ticks, particles and safe deduplication; these baselines are not counted as the still-missing advanced implementations.

The HSDS local baseline is implemented and therefore is not a gap: persisted sessions execute verified SVG visual-state capture → SSE playback → authenticated input → next-frame feedback with adaptive profiles in the UES Stage. Only high-fidelity GPU audiovisual HSDS remains, because it requires an external render/encoder/WebRTC worker. See [HSDS.md](./HSDS.md).

Major remaining DsOS gaps are isolated source checkout, reproducible rootfs/image build, QEMU boot verification, Android toolchain/emulator/signing, legal compatibility runtime, hardware/driver evidence and package trust.

External gates remain public HTTPS, transactional e-mail, Chromium E2E worker, container/microVM execution and object storage.
