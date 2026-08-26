import { composeReality } from './compose.js'
import { contact, elastic1d, graspReach } from './mechanics.js'
import { kineticFriction } from './friction.js'

export const resolveContacts = (prompt = 'oceano salgado com fogo e um humano') => {
  const composed = composeReality(prompt)
  const human = composed.nodes.find(item => item.id === 'human')!
  const tool = composed.nodes.find(item => item.id === 'tool')!
  const outcrop = composed.nodes.find(item => item.id === 'outcrop')!
  const bounce = elastic1d(1.2, 0.8, 4, 0)
  const slide = kineticFriction([1.4, 0, 0.2], 0.4, 1)
  return {
    grasp: graspReach(human, tool),
    rockHit: contact(human, outcrop).hit,
    momentumConserved: bounce.conserved,
    slowed: slide.slowed && Math.hypot(...slide.next) < Math.hypot(1.4, 0, 0.2),
    rigidbodyAsset: false as const,
    traditionalGameplayLoop: false as const,
  }
}
