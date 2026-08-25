import { boxHull } from './convex.js'
import { gjk } from './gjk.js'
import type { Convex, SweepHit } from './types.js'
import type { V3 } from './vec.js'

export const rotationalAdvance = (center: V3, half: V3, yaw0: number, yaw1: number, other: Convex, samples = 12): SweepHit => {
  let hitAt: number | undefined
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const yaw = yaw0 + (yaw1 - yaw0) * t
    if (gjk(boxHull('sweep', center, half, yaw), other).hit) {
      hitAt = t
      break
    }
  }
  if (hitAt === undefined) return { hit: false, toi: 1, method: 'conservative-sampled-rotation' }
  let lo = Math.max(0, hitAt - 1 / samples)
  let hi = hitAt
  for (let step = 0; step < 8; step++) {
    const mid = (lo + hi) / 2
    if (gjk(boxHull('sweep', center, half, yaw0 + (yaw1 - yaw0) * mid), other).hit) hi = mid
    else lo = mid
  }
  return { hit: true, toi: Number(hi.toFixed(5)), method: 'conservative-sampled-rotation' }
}
