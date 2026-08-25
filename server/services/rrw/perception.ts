import { experienceAt } from './observer.js'
import { sampleAllFields } from './fields.js'
import { observerWeights } from './spectrum.js'
import type { ObserverKind, RealityNode } from './types.js'

export const perceiveReality = (nodes: RealityNode[], observerId = 'eye', kind: ObserverKind = 'human-photopic') => {
  const experience = experienceAt(nodes, observerId)
  const observer = nodes.find(item => item.id === observerId) ?? nodes.find(item => item.kind === 'observer')
  const point = observer?.extent.center ?? [0.45, 1.55, 3.55] as [number, number, number]
  const fields = sampleAllFields(nodes, point)
  return {
    ...experience,
    kind,
    weights: observerWeights(kind),
    fields: Object.fromEntries(fields.map(item => [item.kind, item.scalar])),
    framebufferFoundation: false as const,
    pbr: false as const,
  }
}

export const compareObservers = (nodes: RealityNode[]) => {
  const human = perceiveReality(nodes, 'eye', 'human-photopic')
  const insect = perceiveReality(nodes, 'eye', 'insect-uv')
  const thermal = perceiveReality(nodes, 'eye', 'thermal-ir')
  return {
    human: human.light.luminance,
    insect: insect.weights.uv,
    thermal: thermal.weights.fir,
    insectSeesUvMore: insect.weights.uv > human.weights.uv,
    thermalSeesFirMore: thermal.weights.fir > human.weights.fir,
  }
}
