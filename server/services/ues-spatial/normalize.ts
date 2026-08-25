import { buildFixtureTileset } from '../ues-tiles/fixture.js'
import { countTiles } from '../ues-tiles/parser.js'
import type { SpatialAdapterId } from './adapters.js'

export interface NormalizedWorld {
  adapter: SpatialAdapterId
  cells: { id: string; kind: string; provenance: string }[]
  tiles: number
}

export const normalizeSynthetic = (): NormalizedWorld => ({
  adapter: 'synthetic',
  tiles: 1,
  cells: [
    { id: 'land-0', kind: 'continent', provenance: 'procedural-earthlike' },
    { id: 'ocean-0', kind: 'ocean', provenance: 'procedural-earthlike' },
  ],
})

export const normalizeLocal = (): NormalizedWorld => {
  const tileset = buildFixtureTileset()
  return {
    adapter: 'local-fixture',
    tiles: countTiles(tileset.root),
    cells: [{ id: tileset.root.id, kind: 'tileset-root', provenance: 'ues-internal-hlod' }],
  }
}

export const unavailable = (id: Exclude<SpatialAdapterId, 'synthetic' | 'local-fixture'>): NormalizedWorld => ({
  adapter: id,
  tiles: 0,
  cells: [],
})
