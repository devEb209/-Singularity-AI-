import { parseBoundingVolume } from './bounds.js'
import type { Refine, TileNode, Tileset } from './types.js'

interface RawTile {
  boundingVolume: { box?: number[]; sphere?: number[]; region?: number[] }
  geometricError: number
  refine?: string
  content?: { uri?: string }
  children?: RawTile[]
  transform?: number[]
}

interface RawTileset {
  asset?: { version?: string }
  geometricError: number
  root: RawTile
}

const walk = (raw: RawTile, prefix: string, index: number, inherit: Refine): TileNode => {
  const refine = raw.refine === 'ADD' || raw.refine === 'REPLACE' ? raw.refine : inherit
  const id = `${prefix}${index}`
  return {
    id,
    boundingVolume: parseBoundingVolume(raw.boundingVolume),
    geometricError: raw.geometricError,
    refine,
    content: raw.content?.uri ? { uri: raw.content.uri } : undefined,
    children: (raw.children ?? []).map((child, childIndex) => walk(child, `${id}.`, childIndex, refine)),
    transform: raw.transform,
  }
}

export const parseTileset = (raw: RawTileset): Tileset => ({
  asset: { version: '1.1', generator: 'ues-tiles' },
  geometricError: raw.geometricError,
  root: walk(raw.root, 't', 0, raw.root.refine === 'ADD' ? 'ADD' : 'REPLACE'),
  cesiumRequired: false,
})

export const countTiles = (node: TileNode): number =>
  1 + node.children.reduce((sum, child) => sum + countTiles(child), 0)
