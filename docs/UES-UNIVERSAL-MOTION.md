# UES Universal Motion

Structured motion references → joint curves → apply to a skeleton.

- Example card: FN FAL reload with licensed CC0 keyframes.
- Interpolation uses the existing Hermite/smoothstep blend.
- Continuity is tested (`max joint step < 0.45`).
- Explorer Manager applies a selected card onto a selected corpus model and reports missing joints instead of inventing them.
- Extra structured cards: walk, idle, rifle mechanism.
- **Does not analyze video.** Public web/video search remains a Puter adapter-required step.

`POST /api/v1/ues/umotion/compile`  
`POST /api/v1/ues/explorer/apply`
