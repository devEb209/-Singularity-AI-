import { parseTileset } from './parser.js'
import type { Tileset } from './types.js'

const deg = (value: number) => (value * Math.PI) / 180

export const buildFixtureTileset = (): Tileset => {
  const west = deg(-2)
  const east = deg(2)
  const south = deg(-2)
  const north = deg(2)
  const midLon = 0
  const midLat = 0
  const children = [
    { w: west, s: south, e: midLon, n: midLat },
    { w: midLon, s: south, e: east, n: midLat },
    { w: west, s: midLat, e: midLon, n: north },
    { w: midLon, s: midLat, e: east, n: north },
  ].map((quad, index) => {
    const leaves = [
      { w: quad.w, s: quad.s, e: (quad.w + quad.e) / 2, n: (quad.s + quad.n) / 2 },
      { w: (quad.w + quad.e) / 2, s: quad.s, e: quad.e, n: (quad.s + quad.n) / 2 },
      { w: quad.w, s: (quad.s + quad.n) / 2, e: (quad.w + quad.e) / 2, n: quad.n },
      { w: (quad.w + quad.e) / 2, s: (quad.s + quad.n) / 2, e: quad.e, n: quad.n },
    ]
    return {
      boundingVolume: { region: [quad.w, quad.s, quad.e, quad.n, 0, 400] },
      geometricError: 12_000,
      refine: 'REPLACE',
      content: { uri: `internal://quad/${index}` },
      children: leaves.map((leaf, leafIndex) => ({
        boundingVolume: { region: [leaf.w, leaf.s, leaf.e, leaf.n, 0, 220] },
        geometricError: 1_500,
        content: { uri: `internal://leaf/${index}/${leafIndex}` },
      })),
    }
  })
  return parseTileset({
    asset: { version: '1.1' },
    geometricError: 200_000,
    root: {
      boundingVolume: { region: [west, south, east, north, 0, 800] },
      geometricError: 80_000,
      refine: 'REPLACE',
      content: { uri: 'internal://root' },
      children,
    },
  })
}
