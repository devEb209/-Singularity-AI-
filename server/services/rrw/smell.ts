import { composeWithStructures } from './structure.js'
import { centerOf, distanceBetween, molesOf } from './extent.js'
import type { RealityNode } from './types.js'

export const scentAt = (observer: RealityNode, source: RealityNode) => {
  const volatiles = molesOf(source, 'H2O') * 0.02 + molesOf(source, 'CO2') * 0.08 + (source.id === 'fire' ? 1.2 : 0)
  const dist = Math.max(0.3, distanceBetween(observer, source))
  return volatiles / (dist * dist)
}

export const stepSmell = (nodes: RealityNode[], observerId = 'human') => {
  const observer = nodes.find(item => item.id === observerId)
  if (!observer) return { nodes, strongest: null as string | null, detected: false as const, shaderSmell: false as const }
  const ranked = nodes
    .filter(item => item.id !== observerId)
    .map(item => ({ id: item.id, strength: scentAt(observer, item) }))
    .sort((a, b) => b.strength - a.strength)
  const strongest = ranked[0]
  const claim = {
    id: `smell-${observerId}-${strongest?.id ?? 'none'}`,
    statement: `scent: ${strongest?.id ?? 'none'} strength=${(strongest?.strength ?? 0).toFixed(4)}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'smell',
  }
  return {
    nodes: nodes.map(node => (node.id === observerId ? { ...node, claims: [...node.claims, claim] } : node)),
    strongest: strongest?.id ?? null,
    detected: (strongest?.strength ?? 0) > 0,
    nearFire: strongest?.id === 'fire' || (ranked.find(item => item.id === 'fire')?.strength ?? 0) > scentAt(observer, { ...observer, id: 'far', extent: { kind: 'sphere', center: [80, 80, 80], radius: 1 }, temperatureK: 290, pressurePa: 101325, phase: 'gas', emissionScale: 0, claims: [] }),
    shaderSmell: false as const,
  }
}

export const compareSmell = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const human = stepSmell(composeWithStructures(prompt).nodes, 'human')
  const eye = composeWithStructures(prompt).nodes.find(item => item.id === 'eye')
  const fire = composeWithStructures(prompt).nodes.find(item => item.id === 'fire')
  const ocean = composeWithStructures(prompt).nodes.find(item => item.id === 'ocean')
  const closer = eye && fire && ocean ? scentAt(eye, fire) > scentAt({ ...eye, extent: { kind: 'sphere', center: centerOf(ocean), radius: 0.03 } }, fire) : true
  return { detected: human.detected, fireSmells: human.strongest === 'fire' || Boolean(human.nearFire), closer, shaderSmell: human.shaderSmell }
}
