import { UesImage3dCore } from '../ues-image3d/core.js'
import { UesSemantic3dCore } from '../ues-semantic-3d/core.js'
import { UesSolidCore } from '../ues-solid/core.js'
import { canonicalTickets } from './tickets.js'

export const planStages = (intent: string) => [
  { id: 'interpret', tool: 'internal', note: intent.slice(0, 80) },
  { id: 'semantic-3d', tool: 'internal' },
  { id: 'solid', tool: 'internal' },
  { id: 'image3d', tool: 'internal' },
  { id: 'puter-critic', tool: 'puter-ticket' },
  { id: 'integrate', tool: 'internal' },
]

export const executeInternal = (intent: string) => {
  const semantic = new UesSemantic3dCore().process(intent)
  const solid = new UesSolidCore().process(intent)
  const image3d = new UesImage3dCore().process(intent)
  return {
    semantic: { valid: semantic.verification.valid, kind: semantic.semantic.identity.kind },
    solid: { valid: solid.verification.valid, cells: solid.csg.subtract.cells },
    image3d: { valid: image3d.verification.valid, learnedVision: image3d.verification.learnedVision },
  }
}

export const orchestrate = (intent: string) => {
  const stages = planStages(intent)
  const internals = executeInternal(intent)
  const tickets = canonicalTickets()
  return {
    stages,
    internals,
    tickets,
    automaticInternal: true as const,
    automaticPuter: false as const,
    readyToIntegrate: internals.semantic.valid && internals.solid.valid && internals.image3d.valid,
  }
}
