import { clampJoint, forward, type Joint, type Vec2 } from './chain.js'

const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]
const ang = (a: Vec2, b: Vec2) => Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1])

export const iterateCcd = (joints: Joint[], target: Vec2, iterations = 24, threshold = 0.06) => {
  const next = joints.map(item => ({ ...item }))
  for (let step = 0; step < iterations; step++) {
    const points = forward(next)
    const effector = points[points.length - 1]
    const error = Math.hypot(effector[0] - target[0], effector[1] - target[1])
    if (error <= threshold) break
    for (let i = next.length - 1; i >= 0; i--) {
      const current = forward(next)
      const pivot = current[i]
      const ee = current[current.length - 1]
      const toEe = sub(ee, pivot)
      const toTarget = sub(target, pivot)
      next[i] = clampJoint({ ...next[i], angle: next[i].angle + ang(toEe, toTarget) })
    }
  }
  const points = forward(next)
  const effector = points[points.length - 1]
  const residual = Math.hypot(effector[0] - target[0], effector[1] - target[1])
  return {
    joints: next,
    points,
    error: Number(residual.toFixed(5)),
    reached: residual <= threshold,
    limitsHonored: next.every(item => item.angle >= item.min - 1e-9 && item.angle <= item.max + 1e-9),
    featherstone: false as const,
    analyticRotationalCcd: false as const,
  }
}
