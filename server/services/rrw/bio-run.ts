import { compareAlbedo } from './albedo-know.js'
import { compareCarrying } from './carrying.js'
import { compareMigration, stepMigration } from './migration.js'
import { comparePathogen, stepPathogen } from './pathogen.js'
import { compareReef, stepReef } from './reef.js'
import { compareSleep, stepSleep } from './sleep-rest.js'
import { compareSuccession, stepSuccession } from './succession.js'
import { compareTrophic, stepTrophic } from './trophic.js'
import { composeWithStructures } from './structure.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runBio = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const trophic = stepTrophic(composed.nodes, composed.relations)
  const succession = stepSuccession(trophic.nodes)
  const migrated = stepMigration(succession.nodes)
  const slept = stepSleep(migrated.nodes, 2)
  const sick = stepPathogen(slept.nodes)
  const reef = stepReef(sick.nodes)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => reef.nodes.some(item => item.id === id))
  const trophicCmp = compareTrophic(prompt)
  const successionCmp = compareSuccession(prompt)
  const carryingCmp = compareCarrying()
  const migrationCmp = compareMigration(prompt)
  const sleepCmp = compareSleep()
  const pathogenCmp = comparePathogen()
  const reefCmp = compareReef(prompt)
  const albedoCmp = compareAlbedo()
  const valid = trophicCmp.conserved && trophicCmp.grazed
    && successionCmp.conserved && successionCmp.richerSoil
    && carryingCmp.forestSupportsMore && carryingCmp.noFixedCap
    && migrationCmp.moved
    && sleepCmp.nightRests && sleepCmp.dayDoesNot
    && pathogenCmp.weaker && !pathogenCmp.medicalDiagnosis
    && reefCmp.conserved && reefCmp.built
    && albedoCmp.snowBrighter && !albedoCmp.pbr
    && trophic.conserved && reef.conserved
    && sameIds
  return {
    format: 'rrw-bio-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    web: { conserved: trophic.conserved, grazed: trophic.grazed },
    succession: { conserved: succession.conserved, richerSoil: succession.richerSoil },
    carrying: { forestSupportsMore: carryingCmp.forestSupportsMore, noFixedCap: carryingCmp.noFixedCap },
    motion: { migrated: migrated.moved, rested: slept.rested },
    load: { weaker: sick.weaker, medicalDiagnosis: sick.medicalDiagnosis },
    reef: { built: reef.built, conserved: reef.conserved },
    albedo: { snowBrighter: albedoCmp.snowBrighter, pbr: albedoCmp.pbr },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      rpgLoot: false,
      recast: false,
      uniqueFullMinds: false,
      consciousnessClaim: false,
      medicalDiagnosis: false,
      pbr: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Food web, succession, sleep, pathogen load and reef carbonate execute on one graph',
      'Not unique full minds, not medical diagnosis, Genesis is not closed',
    ],
  }
}
