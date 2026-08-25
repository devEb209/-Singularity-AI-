import { applyRefine } from './apply-refine.js'
import { composeReality } from './compose.js'
import type { RealityNode } from './types.js'

export const iterateRefine = (nodes: RealityNode[], max = 4) => {
  let current = nodes
  let last = applyRefine(current)
  let steps = 1
  while (last.after > 0 && steps < max) {
    current = last.nodes
    last = applyRefine(current)
    steps += 1
  }
  return {
    steps,
    remainingPhaseMismatches: last.after,
    settled: last.after === 0,
    inferenceIsFact: false as const,
  }
}

export const iterateBrokenOcean = () => {
  const composed = composeReality('oceano salgado')
  const broken = composed.nodes.map(node => (node.id === 'ocean' ? { ...node, phase: 'gas' as const } : node))
  return iterateRefine(broken, 4)
}
