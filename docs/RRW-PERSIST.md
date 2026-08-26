# RRW persist — same world across operations

Complement to [RRW.md](./RRW.md) and [RRW-LIVE.md](./RRW-LIVE.md). It does **not** replace the Tese dos D.

The live hour already couples climate, reaction, chronicle and refine. Persist keeps **that same reality** across operations:

- Envelope `rrw-session-v1` is the world, not a mesh store.
- Optional JSON files under `data/rrw-worlds/` survive process memory wipes.
- A second persist of the same id continues the fire cooling instead of recomposing.
- Query and D-O15 presentation run on the recalled graph.
- ACL share is owner/peer/stranger. Not WebRTC, not realtime collab.

```text
POST /api/v1/rrw/persist/build
```

Honest limit: this is not a distributed database and not complete reality. `genesisClosed: false`.
