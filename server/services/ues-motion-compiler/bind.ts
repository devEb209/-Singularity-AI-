import { bake } from '../ues-umotion/apply.js'
import type { MotionCard } from '../ues-umotion/cards.js'
import { composeSemantic } from '../ues-semantic-3d/compose.js'

export const bindMotionToObject = (card: MotionCard, prompt: string) => {
  const object = composeSemantic(prompt)
  const frames = bake(card, 10)
  const movable = object.parts.filter(part => part.function === 'locomotion' || /bolt|mag|arm|hand|stock/.test(part.name))
  const applied = frames.frames.map((frame, index) => ({
    t: index / Math.max(1, frames.frames.length - 1),
    parts: movable.map(part => ({
      name: part.name,
      offset: frame.joints[part.name] ?? frame.joints[Object.keys(frame.joints)[0]] ?? 0,
    })),
  }))
  const limits = applied.every(item => item.parts.every(part => Number.isFinite(part.offset) && Math.abs(part.offset) <= 2))
  return {
    object: object.identity.kind,
    parts: movable.map(part => part.name),
    frames: applied.length,
    continuity: frames.continuity,
    limitsHonored: limits,
  }
}
