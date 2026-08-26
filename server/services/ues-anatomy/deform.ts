import type { Bone, SkinWeight, V3 } from './types.js'

const rotateY = (point: V3, pivot: V3, angle: number): V3 => {
  const x = point[0] - pivot[0]
  const z = point[2] - pivot[2]
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [pivot[0] + x * c - z * s, point[1], pivot[2] + x * s + z * c]
}

export const linearBlend = (vertices: V3[], bones: Bone[], weights: SkinWeight[][], boneId: string, angle: number) => {
  const bone = bones.find(item => item.id === boneId)
  if (!bone) return vertices
  return vertices.map((vertex, index) => {
    const influence = weights[index].find(item => item.bone === boneId)?.weight ?? 0
    if (influence <= 0) return vertex
    const rotated = rotateY(vertex, bone.head, angle * influence)
    return rotated
  })
}

export const deformationQuality = (rest: V3[], posed: V3[]) => {
  const jumps = rest.map((vertex, index) => Math.hypot(posed[index][0] - vertex[0], posed[index][1] - vertex[1], posed[index][2] - vertex[2]))
  const maxJump = Math.max(...jumps)
  const finite = posed.flat().every(Number.isFinite)
  return { maxJump: Number(maxJump.toFixed(5)), finite, valid: finite && maxJump < 2.5 }
}
