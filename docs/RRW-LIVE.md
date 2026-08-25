# RRW live — one world, one tick

Complement to [RRW.md](./RRW.md), [RRW-CHRONICLE.md](./RRW-CHRONICLE.md) and the Tese dos D. It does **not** replace them.

The pieces that already execute (climate, hydrology, living reaction, chronicle, refine, walk) now run as **one hour of the same reality**:

- `liveHour` advances fields, weathers rock, reacts, refines phase and remembers the hour with a place tag.
- N hours persist as a session envelope. Same IDs. Shelter survives. Fire cools. Water and silica stay conserved.
- Walk goes to the last remembered place, not a Recast mesh.
- D-O15 presents the live graph, including the chronicle node.

```text
POST /api/v1/rrw/live/build
```

Honest limit: this is not a shipped play loop and not complete reality. `genesisClosed: false`.
