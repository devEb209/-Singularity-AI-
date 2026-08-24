# UES Craft — retopo, anatomy, net, image

CPU reference systems. They do not claim QuadriFlow, scanned anatomy, WebRTC multiplayer or learned super-resolution.

## Operational

- Topology inspect + weld + hole fill + anisotropic edge-flow remesh along semantic parts.
- Humanoid/quadruped templates fitted to mesh bounds, inverse-distance skin weights, LBS deformation quality.
- Authoritative tick, client prediction, snapshot reconcile, simulated latency/loss/jitter/duplicates.
- Rejects speed-hacks, duplicate sequences and spoofed owners.
- Bilinear reconstruction + unsharp, block-match frame interpolation, PSNR and pacing metrics.

`POST /api/v1/ues/craft/build` writes a verified `production.ues-craft` artifact.
