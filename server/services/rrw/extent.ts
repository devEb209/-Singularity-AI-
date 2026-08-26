import { requireSubstance } from './substances.js'
import type { MixturePart, RealityNode } from './types.js'

export const centerOf = (node: RealityNode): [number, number, number] => {
  if (node.extent.center) return node.extent.center
  if (node.extent.min && node.extent.max) {
    return [
      (node.extent.min[0] + node.extent.max[0]) / 2,
      (node.extent.min[1] + node.extent.max[1]) / 2,
      (node.extent.min[2] + node.extent.max[2]) / 2,
    ]
  }
  return [0, 0, 0]
}

export const volumeOf = (node: RealityNode) => {
  if (node.extent.kind === 'sphere' && node.extent.radius) return (4 / 3) * Math.PI * node.extent.radius ** 3
  if (node.extent.kind === 'box' && node.extent.min && node.extent.max) {
    const dx = node.extent.max[0] - node.extent.min[0]
    const dy = node.extent.max[1] - node.extent.min[1]
    const dz = node.extent.max[2] - node.extent.min[2]
    return Math.abs(dx * dy * dz)
  }
  return 1
}

export const geometricMass = (node: RealityNode) => {
  if (!node.substanceId) return 0
  return volumeOf(node) * requireSubstance(node.substanceId).density
}

export const inventoryMass = (parts: MixturePart[] | undefined) =>
  (parts ?? []).reduce((sum, part) => sum + part.moles * requireSubstance(part.substanceId).molarMass / 1000, 0)

export const distanceBetween = (a: RealityNode, b: RealityNode) => {
  const left = centerOf(a)
  const right = centerOf(b)
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2])
}

export const molesOf = (node: RealityNode, substanceId: string) =>
  node.inventory?.find(item => item.substanceId === substanceId)?.moles ?? 0

export const setMoles = (inventory: MixturePart[], substanceId: string, moles: number) => {
  const next = inventory.map(item => (item.substanceId === substanceId ? { ...item, moles } : item))
  if (!next.some(item => item.substanceId === substanceId) && moles > 0) next.push({ substanceId, moles })
  return next.filter(item => item.moles > 1e-12)
}

export const cloneNode = (node: RealityNode): RealityNode => ({
  ...node,
  extent: {
    ...node.extent,
    center: node.extent.center ? [node.extent.center[0], node.extent.center[1], node.extent.center[2]] : undefined,
    min: node.extent.min ? [node.extent.min[0], node.extent.min[1], node.extent.min[2]] : undefined,
    max: node.extent.max ? [node.extent.max[0], node.extent.max[1], node.extent.max[2]] : undefined,
    of: node.extent.of ? [...node.extent.of] : undefined,
  },
  inventory: node.inventory?.map(item => ({ ...item })),
  claims: node.claims.map(item => ({ ...item })),
  living: node.living ? { ...node.living } : undefined,
  magneticMoment: node.magneticMoment ? [node.magneticMoment[0], node.magneticMoment[1], node.magneticMoment[2]] : undefined,
  organism: node.organism
    ? {
        ...node.organism,
        systems: node.organism.systems.map(item => ({ ...item })),
        needs: { ...node.organism.needs },
        perception: { seen: [...node.organism.perception.seen], heard: [...node.organism.perception.heard] },
        consciousnessClaim: false,
      }
    : undefined,
})

export const cloneNodes = (nodes: RealityNode[]) => nodes.map(cloneNode)
