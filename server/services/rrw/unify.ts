import { compareHealth, stepHealth } from './health.js'
import { bindKinship } from './kinship.js'
import { stepLabor } from './labor.js'
import { persistRealityGraph } from './persist-graph.js'
import { runPersist } from './persist-run.js'
import { comparePrecipitation, stepPrecipitation } from './precipitation.js'
import { recallWorld, rememberWorld } from './remember-world.js'
import { compareScatter } from './scatter.js'
import { compareSpeech, utter } from './speech-knowledge.js'
import { stepTrade } from './trade.js'
import { worldIdOf } from './world-id.js'
import { WorldStore } from './world-store.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runUnify = (prompt = defaultPrompt, hours = 3, store = new WorldStore()) => {
  const worldId = worldIdOf(prompt, 'unify')
  const persist = runPersist(prompt, hours, store, worldId)
  const session = recallWorld(store, worldId)
  if (!session) {
    return {
      format: 'rrw-unify-v1' as const,
      architecture: persist.architecture,
      worldId,
      hours,
      persist: {
        fireCooled: persist.fireCooled,
        sameIds: persist.sameIds,
        shelterSurvived: persist.shelterSurvived,
        reloaded: persist.reloaded,
      },
      kin: { bound: false, living: 0, consciousnessClaim: false as const },
      labor: { conserved: false, worked: false, questLog: false as const },
      trade: { conserved: false, traded: false, marketplace: false as const },
      health: { alpineCirculatoryLower: false, humanCirculatory: 0, medicalDiagnosis: false as const, consciousnessClaim: false as const },
      speech: { heard: false, animalHeard: false, tts: false as const, llmVoice: false as const },
      scatter: { cloudDimmer: false, rayTraced: false as const, shaderFog: false as const },
      rain: { rained: false, conserved: false, shaderRain: false as const },
      share: persist.share,
      verification: { ...persist.verification, valid: false, genesisClosed: false, completeReality: false },
      limitations: persist.limitations,
    }
  }
  const kin = bindKinship(session.nodes, session.relations)
  const labor = stepLabor(kin.nodes)
  const trade = stepTrade(labor.nodes, kin.relations)
  const health = stepHealth(trade.nodes)
  const speech = utter(health.nodes, 'human', 'preciso de água', trade.relations)
  const rain = stepPrecipitation(speech.nodes)
  const scatter = compareScatter()
  const frozen = persistRealityGraph(rain.nodes, speech.relations)
  rememberWorld(store, {
    ...session,
    nodes: rain.nodes,
    relations: speech.relations,
    checksum: frozen.checksum,
    payload: frozen.payload,
    lineage: [...session.lineage, frozen.checksum],
  }, worldId)
  const healthCmp = compareHealth()
  const speechCmp = compareSpeech(prompt)
  const rainCmp = comparePrecipitation(prompt)
  const valid = persist.verification.valid
    && kin.bound
    && labor.conserved
    && labor.worked
    && trade.conserved
    && trade.traded
    && healthCmp.alpineCirculatoryLower
    && speechCmp.heard
    && speechCmp.animalHeard
    && !speechCmp.tts
    && scatter.cloudDimmer
    && !scatter.rayTraced
    && rainCmp.conserved
    && rain.rained
  return {
    format: 'rrw-unify-v1' as const,
    architecture: persist.architecture,
    worldId,
    hours,
    persist: {
      fireCooled: persist.fireCooled,
      sameIds: persist.sameIds,
      shelterSurvived: persist.shelterSurvived,
      reloaded: persist.reloaded,
    },
    kin: { bound: kin.bound, living: kin.living, consciousnessClaim: kin.consciousnessClaim },
    labor: { conserved: labor.conserved, worked: labor.worked, questLog: labor.questLog },
    trade: { conserved: trade.conserved, traded: trade.traded, marketplace: trade.marketplace },
    health: {
      alpineCirculatoryLower: healthCmp.alpineCirculatoryLower,
      humanCirculatory: health.humanCirculatory,
      medicalDiagnosis: health.medicalDiagnosis,
      consciousnessClaim: health.consciousnessClaim,
    },
    speech: { heard: speechCmp.heard, animalHeard: speechCmp.animalHeard, tts: speechCmp.tts, llmVoice: speechCmp.llmVoice },
    scatter: { cloudDimmer: scatter.cloudDimmer, rayTraced: scatter.rayTraced, shaderFog: scatter.shaderFog },
    rain: { rained: rain.rained, conserved: rain.conserved, shaderRain: rain.shaderRain },
    share: persist.share,
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      meshStore: false,
      recast: false,
      questLog: false,
      marketplace: false,
      tts: false,
      rayTraced: false,
      shaderRain: false,
      webrtc: false,
      consciousnessClaim: false,
      uniqueFullMinds: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'One persisted world with kinship, labor, trade, health, speech-as-knowledge, scatter and rain',
      'Not a shipped play loop, not consciousness, Genesis is not closed',
    ],
  }
}
