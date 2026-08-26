import type { KnowledgeClaim, RealityNode } from './types.js'

export const chronicleNode = (): RealityNode => ({
  id: 'chronicle',
  kind: 'field',
  label: 'reality chronicle',
  temperatureK: 288,
  pressurePa: 101325,
  phase: 'mixture',
  extent: { kind: 'implicit', field: 'height' },
  emissionScale: 0,
  claims: [],
  domain: 'information',
})

export const remember = (nodes: RealityNode[], statement: string, source = 'chronicle') => {
  const existing = nodes.find(item => item.id === 'chronicle') ?? chronicleNode()
  const claim: KnowledgeClaim = {
    id: `evt-${existing.claims.length + 1}`,
    statement,
    state: 'KNOWN',
    inferred: false,
    source,
  }
  const chronicle = { ...existing, claims: [...existing.claims, claim] }
  return {
    nodes: [...nodes.filter(item => item.id !== 'chronicle'), chronicle],
    claim,
    count: chronicle.claims.length,
    eraseHistory: false as const,
    meshLog: false as const,
  }
}

export const chronicleOf = (nodes: RealityNode[]) =>
  nodes.find(item => item.id === 'chronicle') ?? chronicleNode()

export const statementsOf = (nodes: RealityNode[]) =>
  chronicleOf(nodes).claims.map(item => item.statement)
