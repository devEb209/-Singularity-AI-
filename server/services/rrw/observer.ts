import { acousticTravel } from './acoustics.js'
import { transport } from './coupling.js'
import { climateAt } from './climate.js'
import { solarSpectrum } from './spectrum.js'
import type { RealityNode } from './types.js'

export const experienceAt = (nodes: RealityNode[], observerId = 'eye') => {
  const observer = nodes.find(item => item.id === observerId) ?? nodes.find(item => item.kind === 'observer')
  const ocean = nodes.find(item => item.id === 'ocean')
  const air = nodes.find(item => item.id === 'atmosphere')
  const fire = nodes.find(item => item.id === 'fire')
  const point: [number, number, number] = observer?.extent.center ?? [0, 1.5, 3.5]
  const light = transport({
    sourceEmission: solarSpectrum(),
    media: [
      { substanceId: air?.substanceId ?? 'N2', path: 4 },
      { substanceId: ocean?.substanceId ?? 'H2O', path: 1.2 },
    ],
    observer: 'human-photopic',
  })
  const sound = air && fire?.extent.center
    ? acousticTravel(fire.extent.center, point, air)
    : { distance: 0, seconds: 0, attenuation: 1, shaderAudio: false as const }
  const climate = climateAt(nodes, point)
  return {
    observerId: observer?.id ?? observerId,
    light: { luminance: light.luminance, rayTraced: false, pbr: false },
    sound,
    climate,
    framebufferFoundation: false as const,
    traditionalPipeline: false as const,
  }
}
