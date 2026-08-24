import { blend } from './locomotion.js'
import { clipLibrary, graph, type ClipKind, type MotionClip, type MotionFeature } from './clips.js'

const flatten = (feature: MotionFeature) => [
  ...feature.leftFoot,
  ...feature.rightFoot,
  ...feature.hipVel,
  ...feature.traj.flat(),
]

export const featureDistance = (a: MotionFeature, b: MotionFeature) => {
  const left = flatten(a)
  const right = flatten(b)
  let sum = 0
  for (let i = 0; i < left.length; i++) sum += (left[i] - (right[i] ?? 0)) ** 2
  return Math.sqrt(sum)
}

export const match = (query: MotionFeature, library: MotionClip[], from?: ClipKind) => {
  let best = { clip: library[0], frame: 0, cost: Infinity, legal: false }
  for (const clip of library) {
    if (from && !graph[from].includes(clip.kind)) continue
    for (const [index, frame] of clip.frames.entries()) {
      const cost = featureDistance(query, frame)
      if (cost < best.cost) best = { clip, frame: index, cost, legal: true }
    }
  }
  return best
}

export const transition = (from: ClipKind, to: ClipKind) => ({
  allowed: graph[from].includes(to),
  blend: blend([0, 0, 0], [1, 0.2, 0], 0.5),
})

export const queryFor = (kind: ClipKind) => clipLibrary().find(item => item.kind === kind)!.frames[3]
