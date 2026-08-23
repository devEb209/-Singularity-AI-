# V1 Remaining Gaps Only

This registry intentionally excludes completed capabilities. Canonical API:

```text
GET /api/v1/v1-gaps
GET /api/v1/v1-gaps?area=UES
GET /api/v1/v1-gaps?area=DsOS
GET /api/v1/v1-gaps?area=SNB%20Infrastructure
```

Statuses are limited to `PARTIAL`, `ADAPTER_REQUIRED`, `INFRASTRUCTURE_REQUIRED`, `BLOCKED`, and `PLANNED`. No `ACTIVE` record is permitted in this list.

Major remaining UES gaps are semantic advanced 3D, retopology, rigging/motion, world/physics/NPC/audio/VFX/multiplayer runtimes, target engine adapters, GPU workers, profiling/optimization and multi-target builds.

Major remaining DsOS gaps are isolated source checkout, reproducible rootfs/image build, QEMU boot verification, Android toolchain/emulator/signing, legal compatibility runtime, hardware/driver evidence and package trust.

External gates remain public HTTPS, transactional e-mail, Chromium E2E worker, container/microVM execution and object storage.
