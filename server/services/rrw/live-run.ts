import { applyRefine } from './apply-refine.js'
import { chronicleSize } from './ask-chronicle.js'
import { applyEdit } from './edit-session.js'
import { liveHour } from './live-hour.js'
import { advanceClock } from './orbit.js'
import { persistRealityGraph } from './persist-graph.js'
import { presentLive } from './present-live.js'
import { wrapSession, unwrapSession } from './session-envelope.js'
import { openSession } from './session.js'
import { liveFromReality } from './society-rrw.js'
import { walkToMemory } from './walk-memory.js'
import { waterMoles } from './exchange.js'
import { cloneNodes } from './extent.js'

export const runLive = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo', hours = 6) => {
  let session = applyEdit(openSession(prompt), 'add-shelter')
  const fire0 = session.nodes.find(item => item.id === 'fire')!.temperatureK
  const water0 = waterMoles(session.nodes)
  let nodes = cloneNodes(session.nodes)
  let clock = session.clock
  let conservedWater = true
  let conservedRock = true
  for (let i = 0; i < hours; i++) {
    clock = advanceClock(clock, 1)
    const hour = liveHour(nodes, session.climateBase, session.oceanExtent, session.oceanPressure, clock)
    nodes = hour.nodes
    conservedWater = conservedWater && hour.conservedWater
    conservedRock = conservedRock && hour.conservedRock
  }
  const refined = applyRefine(nodes)
  const frozen = persistRealityGraph(refined.nodes, session.relations)
  session = { ...session, nodes: refined.nodes, clock, checksum: frozen.checksum, payload: frozen.payload, lineage: [...session.lineage, frozen.checksum] }
  const wrapped = wrapSession(session)
  const loaded = unwrapSession(wrapped.envelope)
  const fire1 = loaded.nodes.find(item => item.id === 'fire')!.temperatureK
  const presented = presentLive(loaded.nodes)
  const walked = walkToMemory(loaded.nodes)
  const society = liveFromReality(loaded.nodes, prompt, 24, 48)
  return {
    format: 'rrw-live-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    hours,
    fireCooled: fire1 < fire0,
    conservedWater,
    conservedRock,
    waterMoved: Math.abs(waterMoles(loaded.nodes) - water0) < 1 || conservedWater,
    chronicleGrew: chronicleSize(loaded.nodes) >= hours,
    settled: refined.after === 0,
    sameIds: loaded.nodes.map(item => item.id).sort().join(',') === session.nodes.map(item => item.id).sort().join(','),
    shelterSurvived: loaded.nodes.some(item => item.id === 'shelter'),
    presented: { sameIds: presented.sameIds, framebufferFoundation: presented.framebufferFoundation, hasChronicle: presented.hasChronicle },
    walked: { found: walked.found, recast: walked.recast },
    society: { workSeen: society.workSeen, identities: society.identities },
    verification: {
      valid: fire1 < fire0
        && conservedWater
        && conservedRock
        && chronicleSize(loaded.nodes) >= hours
        && refined.after === 0
        && presented.sameIds
        && walked.found
        && society.workSeen
        && society.identities
        && loaded.nodes.some(item => item.id === 'shelter')
        && !presented.framebufferFoundation,
      traditionalPipeline: false,
      meshIsFoundation: false,
      recast: false,
      meshLog: false,
      consciousnessClaim: false,
      uniqueFullMinds: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'One live tick couples climate, living reaction, chronicle, refine and walk-to-memory',
      'Not a shipped play loop, not consciousness, Genesis is not closed',
    ],
  }
}
