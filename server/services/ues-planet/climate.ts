import { latLon } from '../ues-space/latlon.js'
import { inBounds } from '../ues-shared/math.js'

const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export const oceanDistance = (heights: number[][]) => {
  const size = heights.length
  const dist = Array.from({ length: size }, () => Array.from({ length: size }, () => size * 2))
  const queue: [number, number][] = []
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      if (heights[z][x] > 0) continue
      dist[z][x] = 0
      queue.push([x, z])
    }
  }
  while (queue.length) {
    const [x, z] = queue.shift()!
    for (const [dx, dz] of dirs) {
      const nx = x + dx
      const nz = z + dz
      if (!inBounds(nx, nz, size)) continue
      if (dist[nz][nx] <= dist[z][x] + 1) continue
      dist[nz][nx] = dist[z][x] + 1
      queue.push([nx, nz])
    }
  }
  return dist
}

export const climateAt = (lat: number, height: number, oceanDist: number, river: boolean) => {
  const temperature = 30 * Math.cos((lat * Math.PI) / 180) - Math.max(0, height) * 16
  const moisture = Math.min(1, 0.15 + 0.55 / (1 + oceanDist * 0.35) + (river ? 0.25 : 0))
  return { temperature: Number(temperature.toFixed(3)), moisture: Number(moisture.toFixed(3)) }
}

export const climateField = (heights: number[][], riverMask: boolean[][]) => {
  const dist = oceanDistance(heights)
  const size = heights.length
  return Array.from({ length: size }, (_, z) => Array.from({ length: size }, (_, x) => {
    const { lat } = latLon(x, z, size)
    return climateAt(lat, heights[z][x], dist[z][x], riverMask[z][x])
  }))
}
