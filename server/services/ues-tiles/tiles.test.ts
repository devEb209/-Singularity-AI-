import { describe, expect, it } from 'vitest'
import { geodeticToEcef } from './coords.js'
import { UesTilesCore } from './core.js'
import { lookAt, volumeVisible } from './frustum.js'
import { buildFixtureTileset } from './fixture.js'
import { countTiles, parseTileset } from './parser.js'
import { selectTiles } from './select.js'
import { screenSpaceError } from './sse.js'
import { TileCache } from './cache.js'

describe('UES 3D Tiles HLOD', () => {
  it('converts WGS84, selects fewer tiles from far away and never requires Cesium', () => {
    const equator = geodeticToEcef(0, 0, 0)
    expect(equator[0]).toBeGreaterThan(6_370_000)
    expect(Math.abs(equator[1])).toBeLessThan(1)
    const pole = geodeticToEcef(90, 0, 0)
    expect(Math.abs(pole[0])).toBeLessThan(2)
    expect(pole[2]).toBeGreaterThan(6_350_000)
    const tileset = buildFixtureTileset()
    expect(countTiles(tileset.root)).toBe(21)
    const near = lookAt(geodeticToEcef(0.1, 0.1, 80_000), geodeticToEcef(0, 0, 0))
    const far = lookAt(geodeticToEcef(10, 10, 6_000_000), geodeticToEcef(0, 0, 0))
    const close = selectTiles(tileset.root, near, 16)
    const coarse = selectTiles(tileset.root, far, 16)
    expect(close.length).toBeGreaterThan(0)
    expect(coarse.length).toBeGreaterThan(0)
    expect(coarse.length).toBeLessThanOrEqual(close.length)
    expect(screenSpaceError(400, 1_000, near)).toBeGreaterThan(screenSpaceError(400, 1_000_000, near))
    expect(volumeVisible(tileset.root.boundingVolume, near)).toBe(true)
    const cache = new TileCache(2)
    cache.touch('a', 'internal://a', 1, 1)
    cache.touch('b', 'internal://b', 1, 2)
    expect(cache.touch('c', 'internal://c', 1, 3)).toContain('a')
    const parsed = parseTileset({
      geometricError: 10,
      root: { boundingVolume: { sphere: [0, 0, 0, 5] }, geometricError: 4, content: { uri: 'internal://s' } },
    })
    expect(parsed.cesiumRequired).toBe(false)
    const result = new UesTilesCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.cesium).toBe(false)
    expect(result.liveDataset).toBe(false)
  })
})
