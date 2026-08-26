import { byPrompt } from '../ues-corpus/catalog.js'
import { bake } from './apply.js'
import type { MotionCard } from './cards.js'
import { cardByPrompt } from './catalog.js'

export const applyCardToModel = (card: MotionCard, partNames: string[], samples = 12) => {
  const baked = bake(card, samples)
  const joints = Object.keys(card.keys[0].joints)
  const applied = joints.filter(name => partNames.includes(name))
  const missing = joints.filter(name => !partNames.includes(name))
  return {
    format: 'ues-umotion-apply-v1' as const,
    card: card.id,
    applied,
    missing,
    frames: baked.frames.length,
    continuity: baked.continuity,
    vision: false as const,
    videoSearch: 'adapter-required' as const,
    verification: { valid: baked.continuity && baked.frames.length === samples, vision: false },
  }
}

export const applyPromptToCatalog = (motionPrompt: string, modelPrompt: string) => {
  const card = cardByPrompt(motionPrompt)
  const model = byPrompt(modelPrompt)
  return {
    model: { id: model.id, kind: model.kind, parts: model.parts.map(item => item.name) },
    ...applyCardToModel(card, model.parts.map(item => item.name)),
  }
}
