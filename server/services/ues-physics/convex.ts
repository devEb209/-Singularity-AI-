import type { Convex } from './types.js'
import { add, dot, scale, type V3 } from './vec.js'

export const sphere = (id: string, center: V3, radius: number): Convex => ({
  id,
  center,
  support(dir) {
    const length = Math.hypot(dir[0], dir[1], dir[2])
    if (length < 1e-12) return center
    return add(center, scale(dir, radius / length))
  },
})

export const hull = (id: string, points: V3[]): Convex => {
  if (!points.length) throw new Error('Convex hull requires vertices.')
  const center = points.reduce<V3>((sum, point) => [sum[0] + point[0], sum[1] + point[1], sum[2] + point[2]], [0, 0, 0])
    .map(value => value / points.length) as V3
  return {
    id,
    center,
    support(dir) {
      let best = points[0]
      let score = dot(points[0], dir)
      for (let i = 1; i < points.length; i++) {
        const next = dot(points[i], dir)
        if (next > score) {
          score = next
          best = points[i]
        }
      }
      return best
    },
  }
}

export const boxHull = (id: string, center: V3, half: V3, yaw = 0): Convex => {
  const cosine = Math.cos(yaw)
  const sine = Math.sin(yaw)
  const points: V3[] = []
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const localX = sx * half[0]
        const localZ = sz * half[2]
        points.push([
          center[0] + cosine * localX + sine * localZ,
          center[1] + sy * half[1],
          center[2] - sine * localX + cosine * localZ,
        ])
      }
    }
  }
  return hull(id, points)
}
