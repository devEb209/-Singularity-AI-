import { chebyshev } from '../ues-shared/math.js'
import { heightAt } from './height.js'

export type RegionFidelity = 'full' | 'simplified' | 'dormant'

export const classify = (cell: [number, number], viewer: [number, number], near = 3, mid = 8): RegionFidelity => {
  const d = chebyshev(cell, viewer)
  if (d <= near) return 'full'
  if (d <= mid) return 'simplified'
  return 'dormant'
}

export const partition = (size: number, viewer: [number, number]) => {
  const counts = { full: 0, simplified: 0, dormant: 0 }
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) counts[classify([x, z], viewer)] += 1
  }
  return counts
}

export const reconstruct = (seed: number, x: number, z: number, size: number, seaLevel = 0) =>
  heightAt(seed, x, z, size, seaLevel)
