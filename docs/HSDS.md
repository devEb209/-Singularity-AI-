# HSDS — Hardware Streaming with Divine Singularity

## Honest V1 capability boundary

The V1 includes an **operational local baseline** proving this complete feedback path:

```text
UES project/artifact state → server visual-state capture → SVG sequence encode
→ SSE transport → browser playback → authenticated input channel
→ persisted state update → next verified frame
```

Every frame includes sequence, capture time, dimensions, byte count, SHA-256, artifact count, acknowledged input and verification state. Sessions and camera/input state persist in SQLite and are isolated by user.

This is not presented as GPU framebuffer capture or cloud gaming. The built-in codec is `svg-sequence`, designed as a very light progressive visual-state transport that works without native encoder binaries.

## Adaptive quality

At session creation the server constrains viewport, bandwidth, latency, save-data preference and decode tier into a sustainable resolution, frame rate, bitrate budget and quality target. It prioritizes the highest profile considered sustainable rather than blindly lowering internal artifact quality. The transport profile does not modify source artifacts.

## API

```text
GET  /api/v1/hsds/capabilities
GET  /api/v1/hsds/sessions
POST /api/v1/hsds/sessions
GET  /api/v1/hsds/sessions/:id/stream
POST /api/v1/hsds/sessions/:id/input
POST /api/v1/hsds/sessions/:id/close
```

The stream is authenticated SSE delivered in short reconnectable batches, avoiding long-lived resource retention on low-end clients. Inputs currently accept bounded pointer, touch, keyboard and gamepad-shaped events. The UES Stage provides real playback and keyboard feedback.

## External dependency remaining

High-fidelity audiovisual streaming requires a render worker that can produce a real framebuffer/audio mix, encoder binaries or hardware AV1/VP9/H.264 + Opus, and WebRTC networking (including STUN/TURN where needed). Contracts expose these as adapter-required; they are not marked operational until a provider executes the full chain and passes quality, latency, interaction and artifact/receipt tests.
