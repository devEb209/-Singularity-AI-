import { inhabitWorld } from './inhabit.js'
import { registerPhenomenon } from './catalog.js'
import { editInStudio } from './studio-edit.js'

let registered = false

const ensureHabitationDomain = () => {
  if (registered) return
  registerPhenomenon({
    id: 'habitation',
    family: 'society',
    requiredKnowledge: ['shelter', 'food', 'path'],
    conserved: ['mass', 'energy'],
    defaultDescription: 'discrete-body',
    closedList: false,
  })
  registered = true
}

export const runHabitation = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  ensureHabitationDomain()
  const inhabited = inhabitWorld(prompt)
  const studio = editInStudio(prompt)
  return {
    format: 'rrw-habitation-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    inhabited,
    studio: {
      hasShelter: studio.hasShelter,
      settled: studio.settled,
      shelterSurvived: studio.shelterSurvived,
      resumed: studio.resumed,
      meshViewport: studio.meshViewport,
      aaaEditor: studio.aaaEditor,
    },
    verification: {
      valid: inhabited.verification.valid && studio.hasShelter && studio.settled && studio.shelterSurvived && studio.resumed,
      traditionalPipeline: false,
      meshIsFoundation: false,
      meshViewport: false,
      aaaEditor: false,
      recast: false,
      uniqueFullMinds: false,
      consciousnessClaim: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Habitation binds society, structures, forage and studio edits on a held RRW session',
      'Not a shipped city MMO, not unique full minds, Genesis is not closed',
    ],
  }
}
