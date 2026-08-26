import { DThesisCore } from '../d-thesis/core.js'
import { TileCache } from './cache.js'
import { geodeticToEcef } from './coords.js'
import { lookAt } from './frustum.js'
import { buildFixtureTileset } from './fixture.js'
import { countTiles } from './parser.js'
import { selectTiles } from './select.js'
import { tilesToSemantic } from './semantic.js'
import { screenSpaceError } from './sse.js'

export class UesTilesCore {
  private thesis = new DThesisCore()
  private cache = new TileCache(8)

  process(viewerHeight = 250_000) {
    const tileset = buildFixtureTileset()
    const target = geodeticToEcef(0, 0, 0)
    const eye = geodeticToEcef(0.15, 0.1, viewerHeight)
    const camera = lookAt(eye, target)
    const selected = selectTiles(tileset.root, camera, 18)
    const far = lookAt(geodeticToEcef(8, 8, 4_000_000), target)
    const coarse = selectTiles(tileset.root, far, 18)
    const evicted: string[] = []
    for (const tile of selected) evicted.push(...this.cache.touch(tile.id, tile.uri, 1, selected.indexOf(tile) + 1))
    const semantic = tilesToSemantic(tileset, selected)
    const nearSse = screenSpaceError(400, 2_000, camera)
    const farSse = screenSpaceError(400, 2_000_000, camera)
    const dThesis = this.thesis.evaluate({
      objective: 'Selecionar HLOD de 3D Tiles e convertê-los em células semânticas UES, sem depender de Cesium',
      constraints: ['não fingir tileset Google/Cesium live', 'D-O15 não carrega o planeta inteiro'],
      resources: ['tileset fixture', 'SSE', 'frustum', 'LRU'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-tiles-v1',
      cesiumRequired: false,
      liveDataset: false,
      tree: { tiles: countTiles(tileset.root), selected: selected.length, coarse: coarse.length },
      cache: { resident: this.cache.size(), evicted: evicted.length, budget: 8 },
      semantic,
      sse: { near: Number(nearSse.toFixed(4)), far: Number(farSse.toFixed(4)) },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: selected.length > 0
          && coarse.length > 0
          && coarse.length <= selected.length
          && nearSse > farSse
          && semantic.cells.length === selected.length
          && this.cache.size() <= 8,
        cesium: false,
        googleTiles: false,
      },
      limitations: ['Own HLOD on a synthetic OGC-shaped tileset', 'Not a live Cesium/Google/NASA tileset'],
    }
  }
}
