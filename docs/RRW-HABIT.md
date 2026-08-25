# RRW habitation — inhabit and edit a held world

Complement to [RRW.md](./RRW.md), [RRW-CHAIN.md](./RRW-CHAIN.md) and the Tese dos D. It does **not** replace them.

A described world can now be **inhabited** and **edited** without becoming a traditional city/editor:

- Structures (shelter, path) are reality nodes from the description, not mesh prefabs.
- City residents bind as RRW living nodes. D-O15 keeps the same IDs on weak and strong devices. Overflow is dormant-reconstructable.
- Forage transfers cellulose. Weathering transfers silica. Both conserve moles.
- Contact uses grasp + elastic bounce + friction, not a rigidbody asset.
- Navigation walks a larger grid of extents. Shelter is walkable. Recast is not the identity.
- The studio inspects the reality graph, adds a shelter, breaks a wrong phase and refines it. The shelter survives resume.
- Thermal / insect / photopic observers couple to the same fire/day spectra. No framebuffer foundation.

```text
POST /api/v1/rrw/habit/build
```

Honest limit: this is not a shipped MMO, not unique full minds, not an Unreal editor. `genesisClosed: false`.
