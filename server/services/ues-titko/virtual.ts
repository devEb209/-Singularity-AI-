import { sampleChannel } from './sample.js'
import type { TitkoMaterial } from './graph.js'

export interface VirtualTile {
  u: number
  v: number
  lod: number
  size: number
  pixels: number[]
}

export const tileAt = (material: TitkoMaterial, u: number, v: number, lod: number): VirtualTile => {
  const size = lod <= 0 ? 16 : lod === 1 ? 8 : 4
  const pixels: number[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      pixels.push(sampleChannel(material, u + x / (size * 8), v + y / (size * 8), 4))
    }
  }
  return { u, v, lod, size, pixels }
}

export const residentBytes = (tiles: VirtualTile[]) =>
  tiles.reduce((sum, tile) => sum + tile.pixels.length * 4, 0)
