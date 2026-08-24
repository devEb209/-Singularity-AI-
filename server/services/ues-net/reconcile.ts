import { Authority } from './authority.js'
import type { Entity, PlayerInput } from './types.js'

export const predict = (entity: Entity, inputs: PlayerInput[]) => {
  const sim = new Authority()
  sim.spawn(entity.playerId, entity.x, entity.y)
  for (const input of inputs) sim.apply(input)
  return [...sim.entities.values()][0]
}

export const reconcile = (server: Entity, local: Entity, pending: PlayerInput[]) => {
  const replayed = predict(server, pending)
  const error = Math.hypot(local.x - replayed.x, local.y - replayed.y)
  return {
    corrected: replayed,
    error: Number(error.toFixed(5)),
    snapped: error > 1.5,
  }
}
