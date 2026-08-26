import { composeWithStructures } from './structure.js'
import type { RealityNode } from './types.js'

export const totalCharge = (nodes: RealityNode[]) => nodes.reduce((sum, node) => sum + (node.chargeC ?? 0), 0)

export const stepIonosphere = (nodes: RealityNode[]) => {
  const before = totalCharge(nodes)
  const storm = nodes.find(item => item.id === 'storm')
  const air = nodes.find(item => item.id === 'atmosphere')
  const transfer = storm && air ? Math.min(1e-4, Math.abs(storm.chargeC ?? 0) * 0.1) * Math.sign(storm.chargeC ?? 0) : 0
  const next = nodes.map(node => {
    if (node.id === 'storm') return { ...node, chargeC: (node.chargeC ?? 0) - transfer }
    if (node.id === 'atmosphere') return { ...node, chargeC: (node.chargeC ?? 0) + transfer }
    return node
  })
  const after = totalCharge(next)
  return {
    nodes: next,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-12,
    moved: Math.abs(transfer) > 0,
    shaderLightning: false as const,
  }
}

export const compareIonosphere = (prompt = 'oceano salgado sob céu nublado') => {
  const stepped = stepIonosphere(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, moved: stepped.moved, shaderLightning: stepped.shaderLightning }
}
