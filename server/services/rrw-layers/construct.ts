import { adaptWorld, deviceProfiles, situationsNearShore } from '../rrw/do15.js'
import { composeWithStructures } from '../rrw/structure.js'
import { layerOfNode } from './bind.js'
import { realityLayers } from './catalog.js'
import { coupleAdjacent, coupleEntities } from './couple.js'
import { syntheticForLayer } from './emit.js'
import type { LayerEntity, LayerId } from './types.js'

export const constructProgressive = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo', upTo: LayerId = 29) => {
  const composed = composeWithStructures(prompt)
  const fromWorld: LayerEntity[] = composed.nodes.map(node => ({
    id: node.id,
    layer: layerOfNode(node),
    label: node.label,
    kind: node.kind,
    properties: {
      temperatureK: node.temperatureK,
      phase: node.phase,
      domain: node.domain ?? '',
    },
    description: 'discrete-body',
    inferred: false,
    consciousnessClaim: false,
  }))
  const synthetic = realityLayers.flatMap(layer => (layer.id <= upTo ? syntheticForLayer(layer.id) : []))
  const entities = [...fromWorld, ...synthetic]
  const presentLayers = new Set(entities.map(item => item.layer))
  const missing = realityLayers.filter(layer => layer.id <= upTo && !presentLayers.has(layer.id)).map(item => item.id)
  const extras = missing.flatMap(id => syntheticForLayer(id as LayerId))
  const all = extras.length ? [...entities, ...extras] : entities
  const layersPresent = [...new Set(all.map(item => item.layer))].sort((a, b) => a - b)
  const adjacent = coupleAdjacent()
  const entityLinks = coupleEntities(all.map(item => item.id))
  const adapted = adaptWorld(composed.nodes, situationsNearShore(composed.nodes), deviceProfiles.mobile)
  return {
    prompt,
    upTo,
    entities: all,
    layersPresent,
    catalogSize: realityLayers.length,
    everyLayerKept: realityLayers.every(layer => layer.do15MayDelete === false),
    do15DeletedLayer: false as const,
    adjacent: adjacent.bidirectional,
    links: [...adjacent.links, ...entityLinks],
    descriptions: adapted.adaptations.length,
    lod: adapted.lod,
    consciousnessReproduced: false as const,
    sameIds: composed.nodes.every(node => all.some(item => item.id === node.id)),
  }
}
