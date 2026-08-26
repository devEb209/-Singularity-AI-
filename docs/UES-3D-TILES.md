# UES 3D Tiles / HLOD

The UES owns its HLOD runtime. Cesium Native is a possible future adapter, not a required dependency.

Implemented on a synthetic OGC-shaped tileset:

- root + 4 quads + 16 leaves
- bounding volumes: region, box, sphere
- camera frustum culling
- screen-space error
- REPLACE/ADD refine
- LRU cache with budget eviction
- WGS84 ECEF and local ENU
- selected tiles become UES semantic cells

Not implemented:

- live Cesium ion / Google Photorealistic / NASA tileset download
- GPU mesh decode of `.b3dm` / `.glb` tile payloads
- photogrammetry texturing of Earth

`POST /api/v1/ues/tiles/compile`
