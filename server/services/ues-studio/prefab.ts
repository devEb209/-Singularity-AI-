import type { StudioNode } from './types.js'

export const instantiatePrefab = (nodes: StudioNode[], prefab: StudioNode[], prefix: string, parent: string | null): StudioNode[] => {
  const clones = prefab.map(node => ({
    ...node,
    id: `${prefix}:${node.id}`,
    parent: node.parent ? `${prefix}:${node.parent}` : parent,
    translation: [...node.translation] as StudioNode['translation'],
    rotation: [...node.rotation] as StudioNode['rotation'],
    scale: [...node.scale] as StudioNode['scale'],
  }))
  return [...nodes, ...clones]
}
