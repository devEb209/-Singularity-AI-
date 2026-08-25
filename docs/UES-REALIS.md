# UES Realis — real-data chain without fake integrations

This document complements the Tese dos D and the World Emulation complement. It does not replace them.

Pipeline:

`dados reais ou fixture licenciada → ingestão → normalização → semântica → Tese dos D → representação 3D → D-O15 → streaming/HLOD → simulação`

## Honest states

`GET /api/v1/ues/realis/status` returns the ledger in Portuguese:

- IMPLEMENTADO
- ADAPTER DISPONÍVEL
- DEPENDÊNCIA EXTERNA
- PLANEJADO
- NÃO IMPLEMENTADO

Live NASA, Google Photorealistic Tiles, Cesium ion, USGS/OpenTopography download, video vision and stored 16K bitmaps are **not** marked implemented.

## Operational internally

- Licensed spatial fixture (height, hydro, climate, biome, geology) treated as spatial knowledge.
- Own 3D Tiles HLOD: tileset parse, bounding volumes, frustum, SSE, LRU cache, ECEF→ENU.
- Continuity ladder: space → planet → continent → region → city → street → object.
- FNWS accepts licensed/internal hydro layers. SPH is an adapter interface only.
- TITKO compiles a user material request into a PBR graph and samples it at a D-O15 resolution.
- Explorer Manager applies a structured motion card onto a selected corpus model.
- World synthesis genres (Earth-like, alternate, alien, fantasy, sci-fi) mutate terrestrial rules.
- Astronomical sample: 8 Keplerian planets + Moon + 3 stars + 3 Messier objects. Not n-body, not a complete sky.

`POST /api/v1/ues/realis/build` writes `production.ues-realis`.
