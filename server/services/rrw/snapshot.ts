import { createHash } from 'node:crypto'
import type { RealityNode, RealityRelation } from './types.js'

export const freezeReality = (nodes: RealityNode[], relations: RealityRelation[]) => {
  const payload = JSON.stringify({
    nodes: nodes.map(node => ({
      id: node.id,
      kind: node.kind,
      substanceId: node.substanceId,
      temperatureK: Number(node.temperatureK.toFixed(6)),
      phase: node.phase,
      extent: node.extent,
      living: node.living ?? null,
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
  nodes: { id: string; temperatureK: number; phase: string }[]
  relations: RealityRelation[]
}
