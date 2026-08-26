import type { RealityNode } from '../rrw/types.js'
import type { LayerId } from './types.js'

export const layerOfNode = (node: RealityNode): LayerId => {
  if (node.id === 'star-sol') return 27
  if (node.id === 'planet-ref') return 26
  if (node.id === 'atmosphere' || node.id === 'cloud' || node.id === 'storm') return 9
  if (node.id === 'ocean' || node.id === 'river' || node.id === 'aquifer') return 10
  if (node.id === 'terrain' || node.id === 'outcrop' || node.id === 'soil') return 8
  if (node.id === 'fire') return 5
  if (node.id === 'tool') return 24
  if (node.id === 'shelter' || node.id === 'path') return 25
  if (node.id === 'eye') return 17
  if (node.id === 'chronicle') return 20
  if (node.kind === 'living' || node.living) return 14
  if (node.kind === 'field') return 1
  if (node.kind === 'observer') return 17
  return 6
}
