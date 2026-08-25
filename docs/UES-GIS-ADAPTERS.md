# UES GIS adapters

Vendor-neutral source registry. No single provider is hard-wired.

| Source | V1 state |
| --- | --- |
| Internal licensed fixture | IMPLEMENTADO |
| OGC 3D Tiles contract | ADAPTER DISPONÍVEL |
| Google Photorealistic 3D Tiles | ADAPTER DISPONÍVEL |
| Cesium Native / ion | ADAPTER DISPONÍVEL |
| NASA Earthdata | ADAPTER DISPONÍVEL |
| USGS | ADAPTER DISPONÍVEL |
| OpenTopography | ADAPTER DISPONÍVEL |

Rules:

- unknown / all-rights-reserved licenses cannot enter a production artifact
- V1 never fetches remote bytes (Puter is the only allowed external service)
- a successful internal ingest is spatial knowledge, not a 2D map skin
- a heightfield is not claimed to be “real Earth”

`GET /api/v1/ues/gis/sources`  
`POST /api/v1/ues/gis/ingest`
