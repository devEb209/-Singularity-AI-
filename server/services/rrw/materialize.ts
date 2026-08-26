import { probeWebGpuSync } from '../ues-gpu/webgpu.js'
import { compareMedia, transport } from './coupling.js'
import { exportCompatibilityMesh } from './geometry.js'
import { solarSpectrum } from './spectrum.js'
import { requireSubstance } from './substances.js'
import type { Adaptation, DeviceProfile, RealityNode } from './types.js'

export const materialize = (nodes: RealityNode[], adaptations: Adaptation[], device: DeviceProfile) => {
  const hardware = probeWebGpuSync()
  const backend = hardware.available && device.presentGpu ? 'hardware-present' : 'cpu-field'
  const ocean = nodes.find(item => item.id === 'ocean')
  const waterPath = ocean ? transport({
    sourceEmission: solarSpectrum(),
    media: [{ substanceId: 'H2O', path: 6 }],
    observer: 'human-photopic',
  }) : compareMedia().water
  const samples = adaptations.map(item => {
    const node = nodes.find(entry => entry.id === item.nodeId)
    const substance = node?.substanceId ? requireSubstance(node.substanceId) : undefined
    return {
      id: item.nodeId,
      description: item.description,
      substance: substance?.formula,
      molarMass: substance?.molarMass,
      phase: node?.phase,
      living: node?.living ?? null,
      meshFoundation: false,
      pbrFoundation: false,
    }
  })
  const compatibility = ocean ? exportCompatibilityMesh(ocean.extent) : exportCompatibilityMesh({ kind: 'sphere', center: [0, 0, 0], radius: 1 })
  return {
    backend,
    device: device.class,
    samples,
    water: { luminance: waterPath.luminance, rayTraced: waterPath.rayTraced, formula: 'H2O' },
    compatibility,
    hardware: { available: hardware.available, canRequestAdapter: hardware.canRequestAdapter },
    traditionalPipeline: false,
    meshIsFoundation: false,
    pbrIsFoundation: false,
    lodIsDo15: false,
    hardwareDeterminesArchitecture: false,
    ultraPreset: false,
  }
}
