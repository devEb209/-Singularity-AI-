import { applyEdit } from './edit-session.js'
import { iterateRefine } from './iterate.js'
import { openSession } from './session.js'

export const refineHeld = (prompt = 'oceano salgado com um humano e um abrigo') => {
  let session = applyEdit(openSession(prompt), 'add-shelter')
  session = applyEdit(session, 'break-ocean')
  const refined = iterateRefine(session.nodes, 4)
  return {
    hasShelter: session.nodes.some(item => item.id === 'shelter'),
    settled: refined.settled,
    remaining: refined.remainingPhaseMismatches,
    inferenceIsFact: refined.inferenceIsFact,
    meshViewport: false as const,
  }
}
