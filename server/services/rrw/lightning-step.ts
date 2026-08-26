import { composeWithStructures } from './structure.js'
import { totalCharge } from './ionosphere.js'
import type { RealityNode } from './types.js'

export const stepLightning = (nodes: RealityNode[]) => {
  const cloud = nodes.find(item => item.id === 'cloud')
  const storm = nodes.find(item => item.id === 'storm')
  const before = totalCharge(nodes)
  const delta = cloud && storm ? ((cloud.chargeC ?? 0) - (storm.chargeC ?? 0)) * 0.25 : 0
  const struck = Math.abs(delta) > 1e-6
  const next = nodes.map(node => {
    if (node.id === 'cloud') return { ...node, chargeC: (node.chargeC ?? 0) - delta }
    if (node.id === 'storm') return { ...node, chargeC: (node.chargeC ?? 0) + delta }
    if (node.id === 'fire' && struck) {
      return {
        ...node,
        claims: [...node.claims, { id: 'lightning-ignite', statement: 'discharge coupled to combustion host', state: 'KNOWN' as const, inferred: false, source: 'lightning-step' }],
      }
    }
    return node
  })
  return {
    nodes: next,
    before,
    after: totalCharge(next),
    conserved: Math.abs(totalCharge(next) - before) < 1e-12,
    struck,
    shaderLightning: false as const,
  }
}

export const compareLightning = (prompt = 'oceano salgado com fogo sob céu nublado') => {
  const stepped = stepLightning(composeWithStructures(prompt).nodes)
  return { conserved: stepped.conserved, struck: stepped.struck, shaderLightning: stepped.shaderLightning }
}
