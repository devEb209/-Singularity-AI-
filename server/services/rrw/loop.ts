import { stepChemistry } from './chemistry.js'
import { composeReality } from './compose.js'
import { consultKnowledge } from './consult.js'
import { critiqueReality, refineReality } from './critic.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { stepEcology } from './ecology.js'
import { depositHeat, stepEnergy } from './energy.js'
import { stepExchange } from './exchange.js'
import { recordHistory } from './history.js'
import { fixtureCoastMap, interpretMap } from './map-knowledge.js'
import { presentWorld } from './present.js'
import { describePorts } from './ports.js'
import { budgetOf } from './quantities.js'
import { interpretImageKnowledge } from './image-knowledge.js'
import { scaleLiving } from './scale-living.js'
import { walkReality } from './walk.js'

export const runLoop = (prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano', ticks = 4) => {
  const knowledge = consultKnowledge(prompt)
  const composed = composeReality(prompt)
  const start = budgetOf(composed.nodes)
  let nodes = composed.nodes
  const steps = [{ nodes, relations: composed.relations, note: 'composed' }]
  for (let i = 0; i < ticks; i++) {
    const chemistry = stepChemistry(nodes, 1)
    const heated = depositHeat(chemistry.nodes, chemistry.heatJ, 'fire')
    const energy = stepEnergy(heated, 1)
    const ecology = stepEcology(energy.nodes, 1)
    const exchanged = stepExchange(ecology.nodes, 1)
    const refined = refineReality(exchanged.nodes)
    nodes = refined.nodes
    steps.push({ nodes, relations: [...composed.relations, ...ecology.web], note: `tick-${i}` })
  }
  const critic = critiqueReality(nodes, start, budgetOf(nodes), [
    { id: 'k1', statement: 'H2O boils at 373.15K', state: 'KNOWN', inferred: false, source: 'internal-reference' },
    { id: 'k2', statement: 'H2O boils at 10K', state: 'LIKELY', inferred: true, source: 'unchecked-inference' },
  ])
  const phone = adaptWorld(nodes, situationsNearShore(nodes), deviceProfiles.mobile)
  const desk = adaptWorld(nodes, situationsNearShore(nodes), deviceProfiles.dedicated)
  const presented = presentWorld(nodes, phone.adaptations)
  const history = recordHistory(steps)
  const map = interpretMap(fixtureCoastMap())
  const living = scaleLiving(96)
  const ports = describePorts()
  const walk = walkReality(prompt)
  const image = interpretImageKnowledge()
  const phoneIds = phone.adaptations.map(item => item.nodeId).sort().join(',')
  const deskIds = desk.adaptations.map(item => item.nodeId).sort().join(',')
  return {
    format: 'rrw-loop-v1',
    architecture: 'INTENT → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    intent: knowledge.intent,
    knowledge: { substances: knowledge.substances, puterFired: knowledge.puterFired, nasa: knowledge.nasa },
    composed: { biome: composed.intent.biome, nodes: composed.nodes.length, oceanWater: composed.oceanWater, heightfieldIsIdentity: composed.heightfieldIsIdentity },
    ticks,
    critic: { accepted: critic.accepted, findings: critic.findings.length, inferenceIsFact: critic.inferenceIsFact },
    devices: { sameIds: phoneIds === deskIds, phonePackets: presented.packets.length },
    present: { framebufferFoundation: presented.framebufferFoundation, meshIsFoundation: presented.meshIsFoundation },
    history: { versions: history.versions.length, unique: history.unique, eraseHistory: history.eraseHistory, lineagePreserved: history.lineagePreserved },
    map: { wetland: map.wetland, ridge: map.ridge, pastedHeightmap: map.pastedHeightmap },
    living,
    ports,
    walk: { found: walk.found, recast: walk.recast },
    image: { learnedVision: image.learnedVision, heightfieldIsIdentity: image.heightfieldIsIdentity },
    verification: {
      valid: critic.accepted
        && phoneIds === deskIds
        && living.sameIds
        && !living.conceptualCap
        && map.heightfieldIsIdentity === false
        && presented.framebufferFoundation === false
        && knowledge.puterFired === false
        && ports.fnws.identity === false
        && history.lineagePreserved
        && walk.found
        && image.learnedVision === false,
      traditionalPipeline: false,
      meshIsFoundation: false,
      pbrIsFoundation: false,
      consciousnessClaim: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Close loop executes intent→knowledge→compose→D-O15→present→critic→history',
      'Not a finished Genesis, not learned vision, not a shipped AAA editor',
    ],
  }
}
