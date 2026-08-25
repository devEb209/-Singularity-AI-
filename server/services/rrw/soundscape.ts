import { acousticTravel } from './acoustics.js'
import { applyCircadian } from './circadian.js'
import { composeReality } from './compose.js'
import { centerOf } from './extent.js'
import { echoThroughMedia } from './echo-path.js'

export const compareSoundscape = (prompt = 'oceano salgado com fogo') => {
  const composed = composeReality(prompt)
  const noon = applyCircadian(composed.nodes, 12)
  const night = applyCircadian(composed.nodes, 2)
  const fire = noon.find(item => item.id === 'fire')!
  const eye = noon.find(item => item.id === 'eye')!
  const airNoon = noon.find(item => item.id === 'atmosphere')!
  const airNight = night.find(item => item.id === 'atmosphere')!
  const water = noon.find(item => item.id === 'ocean')!
  const from = centerOf(fire)
  const to = centerOf(eye)
  const noonAir = acousticTravel(from, to, airNoon)
  const nightAir = acousticTravel(from, to, airNight)
  const waterPath = acousticTravel(from, to, water)
  const echo = echoThroughMedia(prompt)
  return {
    noonSeconds: noonAir.seconds,
    nightSeconds: nightAir.seconds,
    waterFaster: waterPath.seconds < noonAir.seconds,
    nightAudible: nightAir.attenuation > 0,
    echo: echo.waterFasterLeg,
    shaderAudio: false as const,
    hrtfAsset: false as const,
  }
}
