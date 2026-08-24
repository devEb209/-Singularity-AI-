import { humanoid, quadruped } from './templates.js'
import type { Bone, SkinWeight, V3 } from './types.js'

const distToSegment = (point: V3, a: V3, b: V3) => {
  const ab: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const ap: V3 = [point[0] - a[0], point[1] - a[1], point[2] - a[2]]
  const denom = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2 || 1
  const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / denom))
  const proj: V3 = [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]
  return Math.hypot(point[0] - proj[0], point[1] - proj[1], point[2] - proj[2])
}

export const chooseTemplate = (kind: string) => (kind.includes('quadruped') ? quadruped : humanoid)

export const fitBones = (template: Bone[], bounds: { min: V3; max: V3 }): Bone[] => {
  const scale: V3 = [
    Math.max(0.2, bounds.max[0] - bounds.min[0]),
    Math.max(0.2, bounds.max[1] - bounds.min[1]),
    Math.max(0.2, bounds.max[2] - bounds.min[2]),
  ]
  const origin: V3 = [
    (bounds.min[0] + bounds.max[0]) / 2,
    bounds.min[1],
    (bounds.min[2] + bounds.max[2]) / 2,
  ]
  return template.map(bone => ({
    ...bone,
    head: [origin[0] + bone.head[0] * scale[0], origin[1] + bone.head[1] * scale[1], origin[2] + bone.head[2] * scale[2]],
    tail: [origin[0] + bone.tail[0] * scale[0], origin[1] + bone.tail[1] * scale[1], origin[2] + bone.tail[2] * scale[2]],
  }))
}

export const skin = (vertices: V3[], bones: Bone[], influences = 2): SkinWeight[][] =>
  vertices.map(vertex => {
    const ranked = bones
      .map(bone => ({ bone: bone.id, distance: distToSegment(vertex, bone.head, bone.tail) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, influences)
    const raw = ranked.map(item => 1 / Math.max(1e-4, item.distance ** 2))
    const sum = raw.reduce((total, value) => total + value, 0)
    return ranked.map((item, index) => ({ bone: item.bone, weight: raw[index] / sum }))
  })
