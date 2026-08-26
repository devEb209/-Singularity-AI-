import { compareCensus, stepCensus } from './census-know.js'
import { compareConflictShare, stepConflictShare } from './conflict-share.js'
import { compareDust, stepDust } from './dust.js'
import { compareGift, stepGift } from './gift.js'
import { compareHeatwave, stepHeatwave } from './heatwave.js'
import { compareHumidity } from './humidity.js'
import { compareNorms, stepNorms } from './norms.js'
import { compareStormSurge, stepStormSurge } from './storm-surge.js'
import { compareTerritory, stepTerritory } from './territory.js'
import { composeWithStructures } from './structure.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runCivic = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const norms = stepNorms(composed.nodes)
  const territory = stepTerritory(norms.nodes)
  const gift = stepGift(territory.nodes)
  const census = stepCensus(gift.nodes)
  const share = stepConflictShare(census.nodes)
  const heat = stepHeatwave(share.nodes)
  const surge = stepStormSurge(heat.nodes)
  const dust = stepDust(surge.nodes)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => dust.nodes.some(item => item.id === id))
  const normsCmp = compareNorms(prompt)
  const territoryCmp = compareTerritory(prompt)
  const giftCmp = compareGift(prompt)
  const censusCmp = compareCensus(prompt)
  const shareCmp = compareConflictShare(prompt)
  const heatCmp = compareHeatwave(prompt)
  const surgeCmp = compareStormSurge(prompt)
  const dustCmp = compareDust(prompt)
  const humidityCmp = compareHumidity()
  const valid = normsCmp.reserved && normsCmp.took
    && territoryCmp.overlap
    && giftCmp.conserved && giftCmp.given
    && censusCmp.count >= 3
    && shareCmp.conserved && shareCmp.shared
    && heatCmp.hotter && heatCmp.canopyHelps
    && surgeCmp.conserved && surgeCmp.risen
    && dustCmp.conserved && dustCmp.lifted
    && humidityCmp.forestWetter
    && gift.conserved && share.conserved && surge.conserved && dust.conserved
    && sameIds
  return {
    format: 'rrw-civic-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    civic: {
      reserved: norms.reserved,
      overlap: territory.overlap,
      given: gift.given,
      census: census.count,
      shared: share.shared,
    },
    extreme: {
      hotter: heat.hotter,
      canopyHelps: heat.canopyHelps,
      risen: surge.risen,
      dust: dust.lifted,
      forestWetter: humidityCmp.forestWetter,
    },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      marketplace: false,
      questLog: false,
      uniqueFullMinds: false,
      shaderHeat: false,
      shaderTide: false,
      particleDust: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Norms, gift, census and weather extremes execute on one graph',
      'Not unique full minds, not a marketplace sim, Genesis is not closed',
    ],
  }
}
