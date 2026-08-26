# UES World Emulation — complement to the D Thesis

This document complements the original Tese dos D. It does not replace, reduce or redefine it.

Pipeline: **real knowledge/rules → D Thesis → adaptation → system → D-O15**.

## Operational (CPU, internal)

- Spatial fields (height, climate, biome, hydro, geology) treated as 3D/spatial knowledge, not 2D map skins.
- Earth-like planet from deterministic geophysical rules. Land, ocean, rivers, lakes, climate bands, biomes, rock types.
- D-O15 representation: near=`full`, mid=`simplified`, far=`dormant` reconstructed from seed. The whole planet is not resident at max fidelity.
- Structured spatial ingest with license policy and a vendor-neutral adapter registry. **No NASA/GIS download.** Internal fixture is operational; live sources stay adapter-available.
- Observable-universe catalog: Keplerian solar-system bodies. **Not an n-body universe.**
- World synthesis: mutate sea level / rules to make alternate/fantasy/sci-fi worlds that stay computationally coherent.
- FNWS: conserved heightfield water, rain/evaporation, downhill flow, Gerstner ocean samples, hydrostatic pressure.
- TITKO: material graphs with virtual 16K/32K reconstruction targets. **Not stored 16K bitmaps.**
- Universal motion: structured cards (example: FN FAL reload) applied with Hermite blend. **Video/vision search is adapter-required (Puter).**
- Creation plan: phases + time budget. Minutes do not finish an AAA world.

`POST /api/v1/ues/emulation/build` writes `production.ues-emulation`.
