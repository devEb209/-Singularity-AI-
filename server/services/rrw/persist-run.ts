import { applyEdit } from './edit-session.js'
import { waterMoles } from './exchange.js'
import { continueStored } from './continue-store.js'
import { presentStored } from './present-persist.js'
import { queryStored } from './query-store.js'
import { recallWorld, rememberWorld } from './remember-world.js'
import { openSession } from './session.js'
import { compareShare, createAccess, grantShare, canAccess } from './share-world.js'
import { worldIdOf } from './world-id.js'
import { WorldStore } from './world-store.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runPersist = (prompt = defaultPrompt, hours = 4, store = new WorldStore(), worldId = worldIdOf(prompt, 'persist')) => {
  const existing = store.get(worldId)
  const created = !existing
  if (created) {
    const opened = applyEdit(openSession(prompt), 'add-shelter')
    rememberWorld(store, opened, worldId)
  }
  if (store.persistent) store.clearMem()
  const loaded = recallWorld(store, worldId)
  if (!loaded) {
    return {
      format: 'rrw-persist-v1' as const,
      architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
      worldId,
      hours,
      created,
      fireCooled: false,
      conservedWater: false,
      sameIds: false,
      shelterSurvived: false,
      lineageGrew: false,
      reloaded: false,
      persistent: store.persistent,
      fireAfter: 0,
      presented: { sameIds: false, framebufferFoundation: false },
      queried: { found: false },
      share: compareShare(),
      verification: {
        valid: false,
        traditionalPipeline: false,
        meshIsFoundation: false,
        meshStore: false,
        databaseDistributed: false,
        webrtc: false,
        consciousnessClaim: false,
        uniqueFullMinds: false,
        webgpuRequired: false,
        automaticPuter: false,
        completeReality: false,
        instantAaa: false,
        genesisClosed: false,
      },
      limitations: ['World envelope was missing after reload'],
    }
  }
  const fire0 = loaded.nodes.find(item => item.id === 'fire')?.temperatureK ?? 0
  const water0 = waterMoles(loaded.nodes)
  const ids0 = new Set(loaded.nodes.map(item => item.id))
  const lineage0 = loaded.lineage.length
  const continued = continueStored(store, worldId, hours)
  if (store.persistent) store.clearMem()
  const again = recallWorld(store, worldId) ?? continued
  const fire1 = again.nodes.find(item => item.id === 'fire')?.temperatureK ?? fire0
  const presented = presentStored(store, worldId)
  const queried = queryStored(store, worldId, 'onde está o abrigo')
  const access = grantShare(createAccess('owner-a'), 'peer-b', 'read')
  const share = {
    owner: canAccess(access, 'owner-a'),
    peer: canAccess(access, 'peer-b'),
    stranger: canAccess(access, 'stranger-c'),
    webrtc: access.webrtc,
    realtime: access.realtime,
  }
  const ids1 = new Set(again.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => ids1.has(id))
  const shelterSurvived = again.nodes.some(item => item.id === 'shelter')
  const conservedWater = Math.abs(waterMoles(again.nodes) - water0) < 1e-6 || Math.abs(waterMoles(again.nodes) - water0) < 1
  const fireCooled = fire1 < fire0
  const lineageGrew = again.lineage.length > lineage0
  return {
    format: 'rrw-persist-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    worldId,
    hours,
    created,
    fireCooled,
    fireAfter: fire1,
    conservedWater,
    sameIds,
    shelterSurvived,
    lineageGrew,
    reloaded: true,
    persistent: store.persistent,
    presented: { sameIds: presented.sameIds, framebufferFoundation: presented.framebufferFoundation, found: presented.found },
    queried: { found: queried.found, meshQuery: queried.meshQuery },
    share,
    verification: {
      valid: fireCooled
        && sameIds
        && shelterSurvived
        && lineageGrew
        && presented.sameIds
        && queried.found
        && share.owner
        && share.peer
        && !share.stranger
        && !presented.framebufferFoundation,
      traditionalPipeline: false,
      meshIsFoundation: false,
      meshStore: false,
      databaseDistributed: false,
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
      'Internal envelope + optional JSON file, not a distributed database or WebRTC collab',
      'Not complete reality, Genesis is not closed',
    ],
  }
}
