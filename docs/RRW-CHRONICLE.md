# RRW chronicle — the held world remembers

Complement to [RRW.md](./RRW.md), [RRW-CONTINUE.md](./RRW-CONTINUE.md) and the Tese dos D. It does **not** replace them.

Events on a held world are **knowledge claims**, not a quest log or a mesh history:

- Fire cooling, forage and living actions are remembered on a `chronicle` node (`eraseHistory: false`).
- Living needs read moles, nearby ocean and felt shelter temperature. Cold seeks shelter. Dry seeks water. Hunger forages.
- Society ticks use RRW heat/rain, not a separate fake weather track.
- Reloading the session envelope keeps the chronicle and the same node IDs.

```text
POST /api/v1/rrw/chronicle/build
```

Honest limit: this is not consciousness and not a shipped diary MMO. `genesisClosed: false`.
