import { inspectReality } from '../rrw-studio/inspect.js'
import { editAndRefine } from './edit-session.js'
import { applyEdit } from './edit-session.js'
import { openSession, resumeSession, tickSession } from './session.js'

export const editInStudio = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const inspected = inspectReality('mobile', prompt)
  const edited = editAndRefine(prompt)
  let session = applyEdit(openSession(prompt), 'add-shelter')
  session = tickSession(session, 2)
  const resumed = resumeSession(session, 2)
  return {
    inspected: inspected.nodes.length,
    hasShelter: edited.hasShelter,
    settled: edited.settled,
    resumed: resumed.resumed,
    shelterSurvived: resumed.session.nodes.some(item => item.id === 'shelter'),
    sameCount: resumed.thawed,
    meshViewport: inspected.meshViewport,
    aaaEditor: inspected.aaaEditor,
    recomposed: resumed.recomposed,
  }
}
