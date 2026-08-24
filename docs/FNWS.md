# FNWS — Fluid and Natural Water System

CPU heightfield water. Not GPU SPH.

- Volume is conserved when rain and evaporation are off.
- Rain adds water on land; evaporation removes a fraction of depth.
- Flow moves water to the lowest 4-neighbor surface.
- Ocean cells start with bathymetric depth (`-height` when height < 0).
- Gerstner samples provide wave η on ocean cells.
- Pressure is `ρ g h` with ρ=1000.

Can ingest internal geophysics or the licensed GIS fixture (precipitation/drainage layers). SPH/GPU remains `ADAPTER DISPONÍVEL` via `ues-fnws/sph.ts`.

Integrated by `ues-emulation` / `ues-realis` and available at `POST /api/v1/ues/fnws/simulate`.
