import { applyEdit } from './edit-session.js'
import { wrapSession, unwrapSession } from './session-envelope.js'
import { openSession, tickSession } from './session.js'

export const continueFromEnvelope = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo', hours = 4) => {
  const opened = applyEdit(openSession(prompt), 'add-shelter')
  const first = tickSession(opened, hours)
  const wrapped = wrapSession(first)
  const loaded = unwrapSession(wrapped.envelope)
  const second = tickSession(loaded, hours)
  const fireBefore = first.nodes.find(item => item.id === 'fire')!.temperatureK
  const fireAfter = second.nodes.find(item => item.id === 'fire')!.temperatureK
  return {
    hours,
    loaded: loaded.nodes.length === first.nodes.length,
    sameIds: loaded.nodes.map(item => item.id).sort().join(',') === first.nodes.map(item => item.id).sort().join(','),
    shelterSurvived: second.nodes.some(item => item.id === 'shelter'),
    resumed: fireAfter < fireBefore,
    fireBefore,
    fireAfter,
    lineage: second.lineage.length,
    recomposed: false as const,
    meshStore: wrapped.meshStore,
  }
}
