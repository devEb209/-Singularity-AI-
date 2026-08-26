import { constructProgressive } from './construct.js'
import { inspectLayer } from './observe.js'
import { presentLayers } from './present.js'
import { compareReplay } from './replay.js'
import { transversalCount, transversalSystems } from './transversal.js'
import { realityLayers } from './catalog.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runLayers = (prompt = defaultPrompt) => {
  const built = constructProgressive(prompt, 29)
  const presented = presentLayers(built.entities)
  const replay = compareReplay()
  const sample = inspectLayer(built.entities, 14)
  const cosmic = inspectLayer(built.entities, 29)
  const cognition = built.entities.find(item => item.id === 'cognition-model')
  const valid = built.catalogSize === 30
    && built.layersPresent.length === 30
    && built.everyLayerKept
    && !built.do15DeletedLayer
    && built.adjacent
    && built.sameIds
    && presented.allPresent
    && !presented.framebufferFoundation
    && replay.pausedHolds
    && replay.sped
    && replay.rewinded
    && sample.count > 0
    && cosmic.count > 0
    && transversalCount === 20
    && cognition?.consciousnessClaim === false
  return {
    format: 'rrw-layers-v1' as const,
    architecture: 'REALIDADE → CONHECIMENTO → TESE DOS D → REPRESENTAÇÃO → D-O15 → RRW → MATERIALIZAÇÃO → VERIFICAÇÃO → REFINAMENTO',
    catalog: realityLayers.map(item => ({ id: item.id, key: item.key, name: item.name, topics: item.topics.length, do15MayDelete: item.do15MayDelete })),
    transversal: transversalSystems.map(item => item.id),
    layersPresent: built.layersPresent,
    entities: built.entities.length,
    organismLayer: sample.count,
    universeLayer: cosmic.count,
    adjacent: built.adjacent,
    replay: { pausedHolds: replay.pausedHolds, sped: replay.sped, rewinded: replay.rewinded, aaaTimeline: replay.aaaTimeline },
    presented: { allPresent: presented.allPresent, framebufferFoundation: presented.framebufferFoundation },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      do15DeletedLayer: false,
      isolatedLayers: false,
      consciousnessReproduced: false,
      consciousnessClaim: false,
      alwaysOnAtomic: false,
      nistAssay: false,
      nasaSurvey: false,
      realtimeGpu: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'All 30 layers exist in the construction fabric; depth still varies (law-level where not yet deep)',
      'D-O15 abstracts description and never deletes a layer',
      'Consciousness remains a model/phenomenon, not reproduced experience',
      'Not complete reality, Genesis is not closed',
    ],
  }
}
