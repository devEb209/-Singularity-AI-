import { volume } from './cycle.js'

export const shallowStep = (depth: number[][], height: number[][], dt = 0.1) => {
  const size = depth.length
  const next = depth.map(row => row.slice())
  for (let z = 1; z < size - 1; z++) {
    for (let x = 1; x < size - 1; x++) {
      const surface = height[z][x] + depth[z][x]
      const lap = (height[z][x - 1] + depth[z][x - 1] + height[z][x + 1] + depth[z][x + 1] + height[z - 1][x] + depth[z - 1][x] + height[z + 1][x] + depth[z + 1][x]) / 4
      next[z][x] = Math.max(0, depth[z][x] + (lap - surface) * dt * 0.35)
    }
  }
  return { depth: next, volume: volume(next), compute: 'ues-fnws-shallow-v1' }
}
