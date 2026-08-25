import { listPhenomena } from './catalog.js'
import { adaptWorld, deviceProfiles } from './do15.js'
import type { DeviceClass, PhenomenonSpec, RealityDescription, RealityNode, Situation } from './types.js'

export const situationForPhenomenon = (spec: PhenomenonSpec, interacting: boolean, distance: number): Situation => ({
  nodeId: spec.id,
  distance,
  relevance: interacting ? 0.9 : 0.4,
  interacting,
  visible: distance < 30,
  phenomenon: spec.family,
  precision: interacting ? 0.75 : 0.35,
})

export const adaptPhenomena = (device: DeviceClass, interacting: string[] = ['combustion', 'organism-need', 'ocean-water']) => {
  const phenomena = listPhenomena()
  const ghosts: RealityNode[] = phenomena.map(item => ({
    id: item.id,
    kind: 'phenomenon',
    label: item.family,
    temperatureK: 288,
    pressurePa: 101325,
    phase: 'mixture',
    extent: { kind: 'relation', of: [] },
    emissionScale: 0,
    claims: [],
    domain: item.family,
  }))
  const situations = phenomena.map(item => situationForPhenomenon(item, interacting.includes(item.id), interacting.includes(item.id) ? 1.2 : 18))
  const adapted = adaptWorld(ghosts, situations, deviceProfiles[device])
  return {
    device,
    adaptations: adapted.adaptations,
    ids: adapted.adaptations.map(item => item.nodeId).sort(),
    lod: false as const,
    ultraPreset: false as const,
    hardwareDeterminesArchitecture: false as const,
  }
}

export const samePhenomenaAcrossDevices = () => {
  const weak = adaptPhenomena('ancient')
  const strong = adaptPhenomena('dedicated')
  const different = weak.adaptations.some(item => item.description !== strong.adaptations.find(entry => entry.nodeId === item.nodeId)?.description)
  return {
    sameIds: weak.ids.join(',') === strong.ids.join(','),
    differentDescription: different,
    weak: Object.fromEntries(weak.adaptations.map(item => [item.nodeId, item.description])) as Record<string, RealityDescription>,
    strong: Object.fromEntries(strong.adaptations.map(item => [item.nodeId, item.description])) as Record<string, RealityDescription>,
  }
}
