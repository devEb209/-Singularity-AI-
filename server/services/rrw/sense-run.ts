import { compareEditClaim, addKnownClaim } from './edit-claim.js'
import { comparePain, stepPain } from './pain-signal.js'
import { compareScentTrail, stepScentTrail } from './scent-trail.js'
import { compareSmell, stepSmell } from './smell.js'
import { compareTaste, stepTaste } from './taste.js'
import { compareTouch, stepTouch } from './touch.js'
import { inspectReality } from '../rrw-studio/inspect.js'
import { composeWithStructures } from './structure.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runSense = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const smell = stepSmell(composed.nodes, 'human')
  const taste = stepTaste(smell.nodes, 'human')
  const touch = stepTouch(taste.nodes)
  const pain = stepPain(touch.nodes)
  const trail = stepScentTrail(pain.nodes)
  const edited = addKnownClaim(trail.nodes, 'human', 'felt the grove wind')
  const inspect = inspectReality('mobile', prompt)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => edited.nodes.some(item => item.id === id))
  const smellCmp = compareSmell(prompt)
  const tasteCmp = compareTaste()
  const touchCmp = compareTouch(prompt)
  const painCmp = comparePain(prompt)
  const trailCmp = compareScentTrail(prompt)
  const editCmp = compareEditClaim(prompt)
  const valid = smellCmp.detected
    && tasteCmp.oceanSalty
    && touchCmp.grasped
    && painCmp.signal
    && !painCmp.consciousnessClaim
    && trailCmp.followed
    && editCmp.kept
    && !editCmp.aaaEditor
    && !inspect.meshViewport
    && inspect.nodes.length > 0
    && sameIds
  return {
    format: 'rrw-sense-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    smell: { detected: smell.detected, strongest: smell.strongest, shaderSmell: smell.shaderSmell },
    taste: { taste: taste.taste, tasted: taste.tasted },
    touch: { grasped: touch.grasped, burned: touch.burned },
    pain: { signal: pain.signal, consciousnessClaim: pain.consciousnessClaim },
    trail: { followed: trail.followed, recast: trail.recast },
    studio: { kept: edited.kept, aaaEditor: edited.aaaEditor, meshViewport: inspect.meshViewport },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      shaderSmell: false,
      recast: false,
      consciousnessClaim: false,
      medicalDiagnosis: false,
      aaaEditor: false,
      meshViewport: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Smell, taste, touch, nociception and scent-trail execute as knowledge, not qualia',
      'Studio edits claims on the graph; not an AAA viewport, Genesis is not closed',
    ],
  }
}
