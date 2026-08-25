import { centerOf, distanceBetween } from './extent.js'
import { requireSubstance } from './substances.js'
import type { RealityNode } from './types.js'

const K = 8.9875517923e9

export const potentialDifference = (a: RealityNode, b: RealityNode) => {
  const qa = a.chargeC ?? 0
  const qb = b.chargeC ?? 0
  const dist = Math.max(0.05, distanceBetween(a, b))
  return K * (qa - qb) / dist
}

export const currentBetween = (a: RealityNode, b: RealityNode) => {
  const sigma = Math.min(
    a.substanceId ? requireSubstance(a.substanceId).electricalConductivity : 0,
    b.substanceId ? requireSubstance(b.substanceId).electricalConductivity : requireSubstance(a.substanceId ?? 'N2').electricalConductivity,
  )
  const length = Math.max(0.05, distanceBetween(a, b))
  const voltage = potentialDifference(a, b)
  return sigma * 0.01 * voltage / length
}

export const electricFieldAt = (nodes: RealityNode[], point: [number, number, number]) => {
  const field: [number, number, number] = [0, 0, 0]
  for (const node of nodes) {
    const q = node.chargeC ?? 0
    if (q === 0) continue
    const c = centerOf(node)
    const dx = point[0] - c[0]
    const dy = point[1] - c[1]
    const dz = point[2] - c[2]
    const r2 = dx * dx + dy * dy + dz * dz || 1
    const scale = K * q / (r2 * Math.sqrt(r2))
    field[0] += dx * scale
    field[1] += dy * scale
    field[2] += dz * scale
  }
  return field
}

export const compareConductors = () => {
  const iron = { id: 'a', kind: 'matter' as const, label: 'iron', substanceId: 'Fe', temperatureK: 293, pressurePa: 101325, phase: 'solid' as const, extent: { kind: 'box' as const, min: [0, 0, 0] as [number, number, number], max: [0.1, 0.01, 0.01] as [number, number, number] }, emissionScale: 0, claims: [], chargeC: 1e-6 }
  const silica = { ...iron, id: 'b', substanceId: 'SiO2', chargeC: 0, extent: { kind: 'box' as const, min: [1, 0, 0] as [number, number, number], max: [1.1, 0.01, 0.01] as [number, number, number] } }
  const throughIron = Math.abs(currentBetween(iron, { ...iron, id: 'c', chargeC: 0, extent: { kind: 'box' as const, min: [0.2, 0, 0] as [number, number, number], max: [0.3, 0.01, 0.01] as [number, number, number] } }))
  const throughSilica = Math.abs(currentBetween(silica, { ...silica, id: 'd', substanceId: 'SiO2', chargeC: 0, extent: { kind: 'box' as const, min: [1.2, 0, 0] as [number, number, number], max: [1.3, 0.01, 0.01] as [number, number, number] } }))
  return { throughIron, throughSilica, ironConductsMore: throughIron > throughSilica, circuitAsset: false as const }
}
