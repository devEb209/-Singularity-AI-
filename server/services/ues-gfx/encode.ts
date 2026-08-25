import { chooseRepresentation } from '../ues-represent/choose.js'
import type { DomainKind } from '../ues-represent/types.js'
import type { GfxCommand } from './types.js'

export interface GfxNode {
  id: string
  domain: DomainKind
  influence: number
  distance: number
  instances: number
  material: string
}

export const encodeFrame = (nodes: GfxNode[], backend: 'cpu-json') => {
  const commands: GfxCommand[] = [{ op: 'Clear' }, { op: 'SetView' }]
  for (const node of nodes) {
    const choice = chooseRepresentation({
      domain: node.domain,
      influence: node.influence,
      distance: node.distance,
      visible: node.influence > 0.08,
      interactive: node.influence > 0.5,
      reconstructable: true,
    })
    if (!choice.render) continue
    commands.push({ op: 'BindMaterial', material: node.material, target: node.id })
    commands.push({ op: 'SetLod', lod: choice.kind === 'full' ? 0 : choice.kind === 'simplified' ? 1 : 2, target: node.id })
    commands.push(node.instances > 1
      ? { op: 'DrawInstance', target: node.id, instances: node.instances }
      : { op: 'DrawMesh', target: node.id })
  }
  return {
    format: 'ues-gfx-frame-v1' as const,
    backend,
    ownsLowLevelApi: false as const,
    commands,
    drawn: commands.filter(item => item.op === 'DrawMesh' || item.op === 'DrawInstance').length,
    culled: nodes.length - commands.filter(item => item.op === 'DrawMesh' || item.op === 'DrawInstance').length,
  }
}
