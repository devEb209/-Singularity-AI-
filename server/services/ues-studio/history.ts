import type { StudioNode, StudioOp, StudioSnapshot, StudioTrack } from './types.js'

const clone = (snapshot: StudioSnapshot): StudioSnapshot => ({
  nodes: snapshot.nodes.map(node => ({ ...node, translation: [...node.translation] as StudioNode['translation'], rotation: [...node.rotation] as StudioNode['rotation'], scale: [...node.scale] as StudioNode['scale'] })),
  tracks: snapshot.tracks.map(track => ({ ...track, keys: track.keys.map(key => ({ ...key })) })),
})

export const applyOp = (snapshot: StudioSnapshot, op: StudioOp): StudioSnapshot => {
  const next = clone(snapshot)
  if (op.kind === 'add') {
    next.nodes.push(op.node)
    return next
  }
  if (op.kind === 'move') {
    const node = next.nodes.find(item => item.id === op.id)
    if (node) node.translation = [...op.translation]
    return next
  }
  if (op.kind === 'reparent') {
    const node = next.nodes.find(item => item.id === op.id)
    if (node) node.parent = op.parent
    return next
  }
  if (op.kind === 'key') {
    const existing = next.tracks.find(track => track.nodeId === op.track.nodeId && track.channel === op.track.channel)
    if (existing) existing.keys = op.track.keys.map(key => ({ ...key }))
    else next.tracks.push({ ...op.track, keys: op.track.keys.map(key => ({ ...key })) })
    return next
  }
  next.nodes = next.nodes.filter(node => node.id !== op.id)
  next.tracks = next.tracks.filter(track => track.nodeId !== op.id)
  return next
}

export class StudioHistory {
  private past: StudioSnapshot[] = []
  private future: StudioSnapshot[] = []

  constructor(private current: StudioSnapshot) {}

  snapshot() {
    return clone(this.current)
  }

  apply(op: StudioOp) {
    this.past.push(clone(this.current))
    this.current = applyOp(this.current, op)
    this.future = []
    return this.snapshot()
  }

  undo() {
    const previous = this.past.pop()
    if (!previous) return this.snapshot()
    this.future.push(clone(this.current))
    this.current = previous
    return this.snapshot()
  }

  redo() {
    const next = this.future.pop()
    if (!next) return this.snapshot()
    this.past.push(clone(this.current))
    this.current = next
    return this.snapshot()
  }

  depth() {
    return { undo: this.past.length, redo: this.future.length }
  }
}

export type { StudioTrack }
