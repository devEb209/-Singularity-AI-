import { inBounds } from '../ues-shared/math.js'
import type { WaterState } from './types.js'

const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export const initWater = (heights: number[][]): number[][] =>
  heights.map(row => row.map(height => (height < 0 ? -height : 0)))

export const rainOnLand = (heights: number[][], depth: number[][], amount: number) => {
  let added = 0
  const next = depth.map((row, z) => row.map((value, x) => {
    if (heights[z][x] <= 0) return value
    added += amount
    return value + amount
  }))
  return { depth: next, added }
}

export const evaporate = (depth: number[][], rate: number) => {
  let lost = 0
  const next = depth.map(row => row.map(value => {
    const drop = value * rate
    lost += drop
    return value - drop
  }))
  return { depth: next, lost }
}

export const volume = (depth: number[][]) => depth.flat().reduce((sum, value) => sum + value, 0)

export const flow = (heights: number[][], depth: number[][], rate = 0.4) => {
  const size = heights.length
  const next = depth.map(row => row.slice())
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      if (next[z][x] <= 1e-8) continue
      const surface = heights[z][x] + next[z][x]
      let best: [number, number] | undefined
      let bestSurface = surface
      for (const [dx, dz] of dirs) {
        const nx = x + dx
        const nz = z + dz
        if (!inBounds(nx, nz, size)) continue
        const neighbor = heights[nz][nx] + next[nz][nx]
        if (neighbor < bestSurface) {
          bestSurface = neighbor
          best = [nx, nz]
        }
      }
      if (!best) continue
      const transfer = Math.min(next[z][x] * rate, (surface - bestSurface) * 0.45)
      next[z][x] -= transfer
      next[best[1]][best[0]] += transfer
    }
  }
  return next
}

export const tickWater = (heights: number[][], state: WaterState, rain: number, evap: number): WaterState => {
  const wet = rainOnLand(heights, state.depth, rain)
  const moved = flow(heights, wet.depth)
  const dried = evaporate(moved, evap)
  return { depth: dried.depth, evaporated: state.evaporated + dried.lost, rained: state.rained + wet.added }
}
