import { blend } from '../ues-motion/locomotion.js'
import type { MotionCard } from './cards.js'

export const sampleCard = (card: MotionCard, t: number) => {
  const u = Math.max(0, Math.min(1, t))
  const later = card.keys.findIndex(key => key.t >= u)
  if (later <= 0) return { ...card.keys[later === 0 ? 0 : card.keys.length - 1].joints }
  const a = card.keys[later - 1]
  const b = card.keys[later]
  const local = (u - a.t) / Math.max(1e-6, b.t - a.t)
  const joints: Record<string, number> = {}
  for (const name of Object.keys(a.joints)) {
    joints[name] = blend([a.joints[name]], [b.joints[name] ?? a.joints[name]], local)[0]
  }
  return joints
}

export const bake = (card: MotionCard, samples = 12) => {
  const frames = Array.from({ length: samples }, (_, i) => ({ t: i / (samples - 1), joints: sampleCard(card, i / (samples - 1)) }))
  const names = Object.keys(card.keys[0].joints)
  const continuity = frames.every((frame, i) => {
    if (i === 0) return true
    return names.every(name => Math.abs(frame.joints[name] - frames[i - 1].joints[name]) < 0.45)
  })
  return { frames, continuity }
}
