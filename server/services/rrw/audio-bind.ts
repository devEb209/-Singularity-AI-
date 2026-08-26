import { acousticTravel } from './acoustics.js'
import { composeReality } from './compose.js'

export const bindAudio = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const fire = composed.nodes.find(item => item.id === 'fire')!
  const eye = composed.nodes.find(item => item.id === 'eye')!
  const air = composed.nodes.find(item => item.id === 'atmosphere')!
  const water = composed.nodes.find(item => item.id === 'ocean')!
  const from = fire.extent.center ?? [1.4, 0.3, 3.2]
  const to = eye.extent.center ?? [0.45, 1.55, 3.55]
  const throughAir = acousticTravel(from, to, air)
  const throughWater = acousticTravel(from, to, water)
  return {
    air: throughAir,
    water: throughWater,
    waterFaster: throughWater.seconds < throughAir.seconds,
    shaderAudio: false as const,
    hrtfAsset: false as const,
  }
}
