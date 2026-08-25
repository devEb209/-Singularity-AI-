import { ecefToEnu } from './coords.js'
import type { SelectedTile, Tileset } from './types.js'

export const tilesToSemantic = (tileset: Tileset, selected: SelectedTile[], origin = { lat: 0, lon: 0 }) => {
  const cells = selected.map(tile => {
    const local = ecefToEnu(
      tile.distance === 0 ? [WGS84_SAFE, 0, 0] : approximateCenter(tile, origin),
      origin.lat,
      origin.lon,
    )
    return {
      tileId: tile.id,
      uri: tile.uri ?? null,
      fidelity: tile.fidelity,
      local: local.map(value => Number(value.toFixed(3))),
      knowledge: 'spatial-cell',
    }
  })
  return {
    format: 'ues-tiles-semantic-v1' as const,
    cesiumRequired: false as const,
    photogrammetryOnly: false as const,
    selected: cells.length,
    cells,
    worldSpace: 'enu-local',
  }
}

const WGS84_SAFE = 6378137

const approximateCenter = (tile: SelectedTile, origin: { lat: number; lon: number }): [number, number, number] => {
  const offset = tile.distance * 0.05
  return [WGS84_SAFE + offset, origin.lon, origin.lat]
}
