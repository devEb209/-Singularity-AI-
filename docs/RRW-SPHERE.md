# RRW sphere — hydro / cryo / geo / atmo

Complement to [RRW.md](./RRW.md) and [RRW-EARTH.md](./RRW-EARTH.md). Earth remains **reference, not limit**.

Sphere executes conserved planetary reservoirs:

- Groundwater aquifer node, watershed drain, flood extent, drought contrast.
- Alpine glacier/snowpack as solid H₂O, not an ice shader.
- Volcano heat + silica transfer, earthquake slip remembered as a claim, sediment to ocean, soil horizons.
- Ozone as extra UV extinction. Tropopause as colder storm/cloud over warmer air.

```text
POST /api/v1/rrw/sphere/build
```

Honest limit: not NASA Earth, not GIS catchments, not NIST O₃. `genesisClosed: false`.
