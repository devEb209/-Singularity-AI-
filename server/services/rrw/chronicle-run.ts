import { compareReactions } from './react-living.js'
import { chronicleSession } from './chronicle-session.js'
import { queryComposed } from './query-world.js'

export const runChronicle = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const session = chronicleSession(prompt)
  const reactions = compareReactions()
  const query = queryComposed(prompt)
  return {
    format: 'rrw-chronicle-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    session: {
      fireCooled: session.fireCooled,
      forageConserved: session.forageConserved,
      chronicleKept: session.chronicleKept,
      fireRemembered: session.fireRemembered,
      forageRemembered: session.forageRemembered,
      sameIds: session.sameIds,
      shelterSurvived: session.shelterSurvived,
      workSeen: session.society.workSeen,
      eraseHistory: session.eraseHistory,
    },
    reactions: {
      coldSeeksShelter: reactions.coldSeeksShelter,
      drySeeksWater: reactions.drySeeksWater,
      hungryForages: reactions.hungryForages,
      remembered: reactions.remembered,
      consciousnessClaim: reactions.consciousnessClaim,
    },
    query: { foundShelter: query.foundShelter, hasWater: query.hasWater },
    verification: {
      valid: session.fireCooled
        && session.forageConserved
        && session.chronicleKept
        && session.fireRemembered
        && session.forageRemembered
        && session.sameIds
        && session.shelterSurvived
        && session.society.workSeen
        && session.society.identities
        && reactions.coldSeeksShelter
        && reactions.drySeeksWater
        && reactions.hungryForages
        && reactions.remembered
        && query.foundShelter
        && !session.eraseHistory,
      traditionalPipeline: false,
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
      'Chronicle remembers events as knowledge claims on the held graph',
      'Not a shipped diary MMO, not consciousness, Genesis is not closed',
    ],
  }
}
