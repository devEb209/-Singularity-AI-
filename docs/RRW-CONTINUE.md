# RRW continuity — continue a held inhabited world

Complement to [RRW.md](./RRW.md), [RRW-CHAIN.md](./RRW-CHAIN.md), [RRW-HABIT.md](./RRW-HABIT.md) and the Tese dos D. It does **not** replace them.

A held world can now be **continued** without becoming a game save slot:

- Time intent reads days / night / winter from the description. It is not a cutscene clock.
- Shelter changes the temperature a living body feels. It is not an indoor shader.
- Forage across days conserves cellulose.
- Soundscape couples fire/air/water. Night stays audible. Not a water shader.
- The held graph can be queried: where is the shelter, how much water, who is living.
- A session envelope reloads clock + climate base + graph. Fire keeps cooling. Shelter survives. Same IDs.
- D-O15 still presents the same inhabited IDs on weak and strong devices.
- A broken ocean phase on the held session still settles.

```text
POST /api/v1/rrw/continue/build
```

Honest limit: this is not a shipped persistent MMO and not complete reality. `genesisClosed: false`.
