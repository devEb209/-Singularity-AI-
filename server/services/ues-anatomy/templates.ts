import type { Bone } from './types.js'

export const humanoid: Bone[] = [
  { id: 'root', parent: null, head: [0, 0, 0], tail: [0, 0.1, 0], role: 'root' },
  { id: 'pelvis', parent: 'root', head: [0, 0.1, 0], tail: [0, 0.35, 0], role: 'spine' },
  { id: 'spine', parent: 'pelvis', head: [0, 0.35, 0], tail: [0, 0.75, 0], role: 'spine' },
  { id: 'chest', parent: 'spine', head: [0, 0.75, 0], tail: [0, 1.05, 0], role: 'spine' },
  { id: 'neck', parent: 'chest', head: [0, 1.05, 0], tail: [0, 1.2, 0], role: 'head' },
  { id: 'head', parent: 'neck', head: [0, 1.2, 0], tail: [0, 1.45, 0], role: 'head' },
  { id: 'l-upper-arm', parent: 'chest', head: [-0.18, 1.0, 0], tail: [-0.45, 0.75, 0], role: 'arm' },
  { id: 'l-lower-arm', parent: 'l-upper-arm', head: [-0.45, 0.75, 0], tail: [-0.62, 0.5, 0], role: 'arm' },
  { id: 'r-upper-arm', parent: 'chest', head: [0.18, 1.0, 0], tail: [0.45, 0.75, 0], role: 'arm' },
  { id: 'r-lower-arm', parent: 'r-upper-arm', head: [0.45, 0.75, 0], tail: [0.62, 0.5, 0], role: 'arm' },
  { id: 'l-upper-leg', parent: 'pelvis', head: [-0.12, 0.32, 0], tail: [-0.14, 0.0, 0], role: 'leg' },
  { id: 'l-lower-leg', parent: 'l-upper-leg', head: [-0.14, 0.0, 0], tail: [-0.14, -0.35, 0], role: 'leg' },
  { id: 'r-upper-leg', parent: 'pelvis', head: [0.12, 0.32, 0], tail: [0.14, 0.0, 0], role: 'leg' },
  { id: 'r-lower-leg', parent: 'r-upper-leg', head: [0.14, 0.0, 0], tail: [0.14, -0.35, 0], role: 'leg' },
]

export const quadruped: Bone[] = [
  { id: 'root', parent: null, head: [0, 0.6, 0], tail: [0, 0.7, 0], role: 'root' },
  { id: 'spine', parent: 'root', head: [0, 0.7, 0], tail: [0.6, 0.85, 0], role: 'spine' },
  { id: 'neck', parent: 'spine', head: [0.6, 0.85, 0], tail: [0.95, 1.05, 0], role: 'head' },
  { id: 'head', parent: 'neck', head: [0.95, 1.05, 0], tail: [1.2, 1.1, 0], role: 'head' },
  { id: 'fl', parent: 'spine', head: [0.45, 0.55, -0.25], tail: [0.45, 0.05, -0.25], role: 'leg' },
  { id: 'fr', parent: 'spine', head: [0.45, 0.55, 0.25], tail: [0.45, 0.05, 0.25], role: 'leg' },
  { id: 'bl', parent: 'root', head: [-0.35, 0.55, -0.25], tail: [-0.35, 0.05, -0.25], role: 'leg' },
  { id: 'br', parent: 'root', head: [-0.35, 0.55, 0.25], tail: [-0.35, 0.05, 0.25], role: 'leg' },
]
