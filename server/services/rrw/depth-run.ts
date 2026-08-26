import { compareAging, stepAging } from './aging.js'
import { compareAgriculture, stepAgriculture } from './agriculture.js'
import { compareCarbon, stepCarbon } from './carbon-cycle.js'
import { compareCulture, shareCulture } from './culture-claim.js'
import { compareDecayLife, stepDecayLife } from './decay-life.js'
import { compareDiet, stepDiet } from './diet.js'
import { compareGrowth, stepGrowth } from './growth.js'
import { compareMemoryTrace, rememberAction } from './memory-trace.js'
import { compareNitrogen, stepNitrogen } from './nitrogen-cycle.js'
import { comparePhosphorus, stepPhosphorus } from './phosphorus-cycle.js'
import { comparePollination, stepPollination } from './pollination.js'
import { compareReproduction, stepReproduction } from './reproduction.js'
import { compareSulfur, stepSulfur } from './sulfur-cycle.js'
import { composeWithStructures } from './structure.js'
import { compareTimeScale } from './time-scale.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runDepth = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const carbon = stepCarbon(composed.nodes)
  const nitrogen = stepNitrogen(carbon.nodes)
  const phosphorus = stepPhosphorus(nitrogen.nodes)
  const sulfur = stepSulfur(phosphorus.nodes)
  const reproduced = stepReproduction(sulfur.nodes, composed.relations)
  const grown = stepGrowth(reproduced.nodes)
  const aged = stepAging(grown.nodes, 0.05)
  const decayed = stepDecayLife(aged.nodes)
  const diet = stepDiet(decayed.nodes)
  const pollen = stepPollination(diet.nodes, reproduced.relations)
  const agri = stepAgriculture(pollen.nodes)
  const memory = rememberAction(agri.nodes, 'human', 'tend-grove')
  const culture = shareCulture(memory.nodes)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => culture.nodes.some(item => item.id === id))
  const carbonCmp = compareCarbon(prompt)
  const nitrogenCmp = compareNitrogen(prompt)
  const phosphorusCmp = comparePhosphorus(prompt)
  const sulfurCmp = compareSulfur(prompt)
  const reproductionCmp = compareReproduction(prompt)
  const growthCmp = compareGrowth(prompt)
  const agingCmp = compareAging()
  const decayCmp = compareDecayLife(prompt)
  const dietCmp = compareDiet(prompt)
  const pollenCmp = comparePollination(prompt)
  const agriCmp = compareAgriculture(prompt)
  const memoryCmp = compareMemoryTrace(prompt)
  const cultureCmp = compareCulture(prompt)
  const time = compareTimeScale()
  const valid = carbonCmp.conserved
    && nitrogenCmp.conserved
    && phosphorusCmp.conserved
    && sulfurCmp.conserved
    && carbon.conserved
    && nitrogen.conserved
    && phosphorus.conserved
    && sulfur.conserved
    && reproductionCmp.spawned
    && reproductionCmp.once
    && growthCmp.grew
    && growthCmp.conserved
    && agingCmp.olderWeaker
    && decayCmp.conserved
    && dietCmp.conserved
    && pollenCmp.conserved
    && pollenCmp.pollinated
    && agriCmp.conserved
    && memoryCmp.remembered
    && cultureCmp.shared
    && time.notLod
    && sameIds
    && !reproductionCmp.consciousnessClaim
  return {
    format: 'rrw-depth-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    sapling: reproduced.spawned,
    cycles: {
      carbon: carbon.conserved,
      nitrogen: nitrogen.conserved,
      phosphorus: phosphorus.conserved,
      sulfur: sulfur.conserved,
    },
    living: {
      spawned: reproduced.spawned,
      grew: grown.grew,
      olderWeaker: agingCmp.olderWeaker,
      decayed: decayed.decayed,
      respired: diet.respired,
      pollinated: pollen.pollinated,
      tended: agri.tended,
    },
    knowledge: {
      remembered: memory.remembered,
      culture: culture.shared,
      timeNotLod: time.notLod,
    },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      closedWorld: false,
      nistAssay: false,
      consciousnessClaim: false,
      uniqueFullMinds: false,
      lodPreset: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Cycles, growth, decay and culture-as-claims execute on one graph',
      'Not complete reality, not NIST, Genesis is not closed',
    ],
  }
}
