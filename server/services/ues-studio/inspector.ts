import type { StudioNode, StudioTrack } from './types.js'

export const inspectNode = (node: StudioNode, tracks: StudioTrack[]) => ({
  id: node.id,
  name: node.name,
  parent: node.parent,
  transform: {
    translation: node.translation,
    rotation: node.rotation,
    scale: node.scale,
  },
  mesh: node.mesh ?? null,
  material: node.material ?? null,
  animated: tracks.filter(track => track.nodeId === node.id).map(track => ({
    channel: track.channel,
    keys: track.keys.length,
  })),
  fields: ['translation', 'rotation', 'scale', 'mesh', 'material', 'parent'],
})

export const inspectScene = (nodes: StudioNode[], tracks: StudioTrack[]) =>
  nodes.map(node => inspectNode(node, tracks))
