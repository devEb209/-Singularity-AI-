import { UesAnatomyCore } from '../ues-anatomy/core.js'
import { fitBones } from '../ues-anatomy/infer.js'
import { humanoid } from '../ues-anatomy/templates.js'
import type { Bone } from '../ues-anatomy/types.js'

const lengthOf = (bone: Bone) => Math.hypot(bone.tail[0] - bone.head[0], bone.tail[1] - bone.head[1], bone.tail[2] - bone.head[2])

export const symmetryPairs = (bones: Bone[]) => {
  const pairs = [
    ['l-upper-arm', 'r-upper-arm'],
    ['l-lower-arm', 'r-lower-arm'],
    ['l-upper-leg', 'r-upper-leg'],
    ['l-lower-leg', 'r-lower-leg'],
  ]
  return pairs.map(([leftId, rightId]) => {
    const left = bones.find(item => item.id === leftId)
    const right = bones.find(item => item.id === rightId)
    const leftLen = left ? lengthOf(left) : 0
    const rightLen = right ? lengthOf(right) : 0
    const delta = Math.abs(leftLen - rightLen) / Math.max(1e-6, (leftLen + rightLen) / 2)
    return { left: leftId, right: rightId, delta: Number(delta.toFixed(4)), ok: delta < 0.08 }
  })
}

export const headToHeight = (bones: Bone[]) => {
  const heads = bones.flatMap(item => [item.head[1], item.tail[1]])
  const height = Math.max(...heads) - Math.min(...heads)
  const head = bones.find(item => item.id === 'head')
  const headLen = head ? lengthOf(head) : 0
  const ratio = headLen > 1e-6 ? height / headLen : 0
  return { height: Number(height.toFixed(4)), head: Number(headLen.toFixed(4)), ratio: Number(ratio.toFixed(3)), ok: ratio >= 5 && ratio <= 10 }
}

export const anatomyReport = (prompt = 'humano') => {
  const processed = new UesAnatomyCore().process(prompt)
  const fitted = fitBones(humanoid, { min: [0, 0, 0], max: [1, 1.7, 1] })
  const pairs = symmetryPairs(fitted)
  const canon = headToHeight(fitted)
  return {
    format: 'ues-anatomy-critic-v1',
    processed: processed.verification,
    pairs,
    canon,
    verification: {
      valid: processed.verification.valid && pairs.every(item => item.ok) && canon.ok,
      scanned: false,
    },
  }
}
