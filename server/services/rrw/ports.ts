import { exportCompatibilityMesh } from './geometry.js'
import { materializeOcean } from './hydro.js'
import { seedReality } from './world.js'

export const describePorts = () => {
  const ocean = seedReality().nodes.find(item => item.id === 'ocean')!
  return {
    fnws: { ...materializeOcean(ocean.temperatureK), identity: false as const },
    mesh: { ...exportCompatibilityMesh(ocean.extent), foundation: false as const },
    radiance: { compatibility: true as const, foundation: false as const, beatsUnreal: false as const },
    hardwareGpu: { required: false as const, present: false as const },
    traditionalPipeline: false as const,
  }
}
