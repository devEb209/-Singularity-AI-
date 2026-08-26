import { acousticTravel } from './acoustics.js'
import { composeReality } from './compose.js'
import { centerOf } from './extent.js'

export const echoThroughMedia = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const fire = composed.nodes.find(item => item.id === 'fire')!
  const eye = composed.nodes.find(item => item.id === 'eye')!
  const air = composed.nodes.find(item => item.id === 'atmosphere')!
  const water = composed.nodes.find(item => item.id === 'ocean')!
  const from = centerOf(fire)
  const mid: [number, number, number] = [from[0], 0.05, from[2]]
  const to = centerOf(eye)
  const airLeg = acousticTravel(from, to, air)
  const waterLeg = acousticTravel(from, mid, water)
  const mixed = acousticTravel(mid, to, air)
  return {
    airSeconds: airLeg.seconds,
    mixedSeconds: waterLeg.seconds + mixed.seconds,
    waterFasterLeg: waterLeg.seconds < airLeg.seconds,
    shaderAudio: false as const,
    hrtfAsset: false as const,
  }
}
