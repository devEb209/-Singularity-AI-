import { continueFromEnvelope } from './continue-session.js'
import { inhabitDays } from './days-inhabit.js'
import { forageDays } from './food-days.js'
import { parseTimeIntent } from './intent-time.js'
import { presentInhabited } from './present-inhabit.js'
import { queryComposed } from './query-world.js'
import { refineHeld } from './refine-held.js'
import { compareShelterClimate } from './shelter-climate.js'
import { compareSoundscape } from './soundscape.js'

export const runContinuity = (prompt = '2 dias de oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const time = parseTimeIntent(prompt)
  const days = inhabitDays(prompt)
  const food = forageDays(prompt, time.days)
  const shelter = compareShelterClimate(prompt)
  const sound = compareSoundscape(prompt)
  const query = queryComposed(prompt)
  const continued = continueFromEnvelope(prompt, 4)
  const presented = presentInhabited(prompt)
  const refined = refineHeld(prompt)
  return {
    format: 'rrw-continuity-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    time: { days: time.days, season: time.season, wantsNight: time.wantsNight },
    days: { shelter: days.shelter, conservedFood: days.conservedFood, conservedRock: days.conservedRock, workSeen: days.workSeen },
    food: { conserved: food.conserved, humanGained: food.humanGained },
    shelter: { shelterWarmer: shelter.shelterWarmer, shaderIndoor: shelter.shaderIndoor },
    sound: { waterFaster: sound.waterFaster, nightAudible: sound.nightAudible, shaderAudio: sound.shaderAudio },
    query: { foundShelter: query.foundShelter, hasWater: query.hasWater, hasLiving: query.hasLiving },
    continued: { resumed: continued.resumed, shelterSurvived: continued.shelterSurvived, sameIds: continued.sameIds, recomposed: continued.recomposed },
    presented: { sameIds: presented.sameIds, weakerDescribesLess: presented.weakerDescribesLess, framebufferFoundation: presented.framebufferFoundation, meshIsFoundation: presented.meshIsFoundation },
    refined: { settled: refined.settled, hasShelter: refined.hasShelter },
    verification: {
      valid: days.shelter
        && days.conservedFood
        && days.conservedRock
        && food.conserved
        && food.humanGained
        && shelter.shelterWarmer
        && sound.waterFaster
        && sound.nightAudible
        && query.foundShelter
        && query.hasWater
        && continued.resumed
        && continued.shelterSurvived
        && continued.sameIds
        && presented.sameIds
        && presented.weakerDescribesLess
        && refined.settled
        && days.workSeen,
      traditionalPipeline: false,
      meshIsFoundation: false,
      shaderAudio: false,
      shaderIndoor: false,
      webgpuRequired: false,
      automaticPuter: false,
      consciousnessClaim: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Continuity reloads a held inhabited session, queries it and runs more days',
      'Not a shipped persistent MMO, not NIST, Genesis is not closed',
    ],
  }
}
