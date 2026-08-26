import { remember } from './chronicle.js'
import { askChronicle, chronicleSize } from './ask-chronicle.js'
import { applyEdit } from './edit-session.js'
import { stepForage } from './economy.js'
import { reactLiving } from './react-living.js'
import { wrapSession, unwrapSession } from './session-envelope.js'
import { openSession, tickSession } from './session.js'
import { liveFromReality } from './society-rrw.js'

export const chronicleSession = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo', hours = 4) => {
  let session = applyEdit(openSession(prompt), 'add-shelter')
  const fire0 = session.nodes.find(item => item.id === 'fire')!.temperatureK
  session = tickSession(session, hours)
  const fire1 = session.nodes.find(item => item.id === 'fire')!.temperatureK
  const forage = stepForage(session.nodes)
  session = { ...session, nodes: forage.nodes }
  const cooled = remember(session.nodes, `fire cooled ${fire0.toFixed(2)} -> ${fire1.toFixed(2)}`, 'chronicle')
  const foraged = remember(cooled.nodes, `forage conserved=${forage.conserved} take=${forage.take.toFixed(3)}`, 'chronicle')
  const reacted = reactLiving(foraged.nodes)
  session = { ...session, nodes: reacted.nodes }
  const wrapped = wrapSession(session)
  const loaded = unwrapSession(wrapped.envelope)
  const society = liveFromReality(loaded.nodes, prompt, 24, 48)
  const asked = askChronicle(loaded.nodes, 'o que aconteceu com o fogo')
  const forageAsk = askChronicle(loaded.nodes, 'houve forrage')
  return {
    hours,
    fireCooled: fire1 < fire0,
    forageConserved: forage.conserved,
    chronicleKept: chronicleSize(loaded.nodes) >= 2,
    fireRemembered: asked.found,
    forageRemembered: forageAsk.found,
    sameIds: loaded.nodes.map(item => item.id).sort().join(',') === session.nodes.map(item => item.id).sort().join(','),
    shelterSurvived: loaded.nodes.some(item => item.id === 'shelter'),
    society: { workSeen: society.workSeen, identities: society.identities },
    action: reacted.action,
    eraseHistory: false as const,
    meshLog: false as const,
    recomposed: false as const,
  }
}
