import type { MotionCard } from './cards.js'
import { reloadFal } from './cards.js'

export const walkCycle: MotionCard = {
  id: 'walk-cycle',
  title: 'Human walk (structured)',
  subject: 'human',
  license: 'CC0',
  source: 'structured-not-video',
  keys: [
    { t: 0, joints: { 'l-upper-leg': 0.18, 'r-upper-leg': -0.12, 'l-lower-leg': 0.08, 'r-lower-leg': 0.2, spine: 0.02 } },
    { t: 0.5, joints: { 'l-upper-leg': -0.12, 'r-upper-leg': 0.18, 'l-lower-leg': 0.2, 'r-lower-leg': 0.08, spine: -0.02 } },
    { t: 1, joints: { 'l-upper-leg': 0.18, 'r-upper-leg': -0.12, 'l-lower-leg': 0.08, 'r-lower-leg': 0.2, spine: 0.02 } },
  ],
}

export const idleBreath: MotionCard = {
  id: 'idle-breath',
  title: 'Idle breath (structured)',
  subject: 'human',
  license: 'CC0',
  source: 'structured-not-video',
  keys: [
    { t: 0, joints: { spine: 0, 'l-upper-arm': 0.05, 'r-upper-arm': 0.05 } },
    { t: 0.5, joints: { spine: 0.03, 'l-upper-arm': 0.07, 'r-upper-arm': 0.07 } },
    { t: 1, joints: { spine: 0, 'l-upper-arm': 0.05, 'r-upper-arm': 0.05 } },
  ],
}

export const reloadRifle: MotionCard = {
  id: 'reload-rifle-mechanism',
  title: 'Rifle bolt/mag (structured)',
  subject: 'weapon',
  license: 'CC0',
  source: 'structured-not-video',
  keys: [
    { t: 0, joints: { mag: 0, bolt: 0 } },
    { t: 0.35, joints: { mag: 0.8, bolt: 0.15 } },
    { t: 0.7, joints: { mag: 0.1, bolt: 0.85 } },
    { t: 1, joints: { mag: 0, bolt: 0 } },
  ],
}

export const motionCatalog: MotionCard[] = [reloadFal, walkCycle, idleBreath, reloadRifle]

export const cardById = (id: string) => motionCatalog.find(item => item.id === id) ?? reloadFal

export const cardByPrompt = (prompt: string) => {
  const text = prompt.toLowerCase()
  if (/bolt|mecanismo|carregador|magazine/.test(text)) return reloadRifle
  if (/fal|recarga|reload/.test(text)) return reloadFal
  if (/walk|andar|caminh/.test(text)) return walkCycle
  if (/idle|parado|respir/.test(text)) return idleBreath
  return reloadFal
}
