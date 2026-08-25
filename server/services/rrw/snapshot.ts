import { createHash } from 'node:crypto'
import type { RealityNode, RealityRelation } from './types.js'

export const freezeReality = (nodes: RealityNode[], relations: RealityRelation[]) => {
  const payload = JSON.stringify({
    nodes: nodes.map(node => ({
      id: node.id,
      kind: node.kind,
      label: node.label,
      substanceId: node.substanceId,
      temperatureK: Number(node.temperatureK.toFixed(6)),
      pressurePa: node.pressurePa,
      phase: node.phase,
      extent: node.extent,
      living: node.living ?? null,
      emissionScale: node.emissionScale,
      claims: node.claims,
      inventory: node.inventory ?? [],
      chargeC: node.chargeC,
      magneticMoment: node.magneticMoment,
      domain: node.domain,
    })),
    relations,
  })
  return {
    bytes: payload.length,
    checksum: createHash('sha256').update(payload).digest('hex'),
    payload,
    meshStore: false as const,
  }
}

export const thawReality = (frozen: { payload: string }) => JSON.parse(frozen.payload) as {
  nodes: RealityNode[]
  relations: RealityRelation[]
}

export const thawNodes = (frozen: { payload: string }): RealityNode[] =>
  thawReality(frozen).nodes.map(node => ({
    ...node,
    claims: node.claims ?? [],
    emissionScale: node.emissionScale ?? 0,
    pressurePa: node.pressurePa ?? 101325,
  }))
