import type { HardwareTier, RealityMode, Representation } from './types.js'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export const perceptualEquivalent = (a: Representation, b: Representation, threshold = 6) => {
  const close = Math.abs(a.perceptual - b.perceptual) <= threshold
  const aligned = b.objectiveAlignment >= a.objectiveAlignment - 0.05
  return close && aligned && b.cost < a.cost
}

export const chooseEquivalent = (candidates: Representation[], threshold = 6) => {
  const ranked = [...candidates].sort((a, b) => b.perceptual - a.perceptual || a.cost - b.cost)
  const best = ranked[0]
  if (!best) return { selected: undefined as Representation | undefined, rejected: [] as Representation[], reason: 'no representation' }
  const cheaper = ranked.find(item => item.id !== best.id && perceptualEquivalent(best, item, threshold))
  if (cheaper) return { selected: cheaper, rejected: ranked.filter(item => item.id !== cheaper.id), reason: 'D-O15 selected a cheaper perceptually equivalent representation' }
  return { selected: best, rejected: ranked.slice(1), reason: 'no cheaper equivalent inside the perceptual threshold' }
}

export const hardwareBudget = (tier: HardwareTier) => (tier === 'low' ? 42 : tier === 'high' ? 100 : 70)

export const adaptToHardware = (objective: string, tier: HardwareTier, representations: Representation[]) => {
  const hay = objective.toLowerCase()
  const bias = (item: Representation) => {
    if (/npc|diálogo|dialogo|personagem|sociedade/.test(hay) && item.kind === 'npc') return 1.35
    if (/conversa|história|historia|narrativa/.test(hay) && item.kind === 'npc') return 1.4
    if (/física|fisica|colisão|colisao/.test(hay) && item.kind === 'physics') return 1.25
    if (/luz|material|aparência|aparencia/.test(hay) && (item.kind === 'lighting' || item.kind === 'material')) return 1.2
    return 1
  }
  const ranked = [...representations].sort((a, b) => {
    const scoreA = (a.essential ? 100 : 0) + a.objectiveAlignment * 40 * bias(a) + a.perceptual * 0.2
    const scoreB = (b.essential ? 100 : 0) + b.objectiveAlignment * 40 * bias(b) + b.perceptual * 0.2
    return scoreB - scoreA
  })
  const budget = hardwareBudget(tier)
  let spent = 0
  const kept: Representation[] = []
  const dropped: Representation[] = []
  const substituted: { from: string; to: string }[] = []
  for (const item of ranked) {
    const cost = item.cost * (tier === 'low' ? 1 : tier === 'high' ? 0.85 : 0.95)
    if (spent + cost <= budget || item.essential) {
      kept.push({ ...item, cost: Number(cost.toFixed(2)) })
      spent += item.essential ? Math.min(cost, budget * 0.45) : cost
      continue
    }
    const cheaper: Representation = { ...item, id: `${item.id}-lod`, cost: item.cost * 0.45, perceptual: item.perceptual - 4, objectiveAlignment: item.objectiveAlignment - 0.03, essential: false }
    if (perceptualEquivalent(item, cheaper, 8) && spent + cheaper.cost <= budget) {
      kept.push(cheaper)
      substituted.push({ from: item.id, to: cheaper.id })
      spent += cheaper.cost
    } else dropped.push(item)
  }
  return {
    tier,
    budget,
    spent: Number(spent.toFixed(2)),
    kept,
    dropped,
    substituted,
    rule: 'Hardware adaptation redistributes fidelity toward the objective; it is not merely lowering graphics.',
    notJustLowerGraphics: true,
  }
}

export const defaultRepresentations = (mode: RealityMode): Representation[] => [
  { id: 'semantic-npc', kind: 'npc', cost: 22, perceptual: 88, objectiveAlignment: 0.9, essential: false },
  { id: 'rigid-physics', kind: 'physics', cost: 18, perceptual: 80, objectiveAlignment: 0.7, essential: false },
  { id: 'direct-lighting', kind: 'lighting', cost: 16, perceptual: 84, objectiveAlignment: 0.6, essential: false },
  { id: 'material-graph', kind: 'material', cost: 14, perceptual: 82, objectiveAlignment: 0.55, essential: false },
  { id: 'particle-burst', kind: 'particle', cost: 12, perceptual: 70, objectiveAlignment: 0.25, essential: false },
  { id: 'hi-res-geometry', kind: 'geometry', cost: 28, perceptual: 86, objectiveAlignment: 0.5, essential: false },
  { id: 'clustered-geometry', kind: 'geometry', cost: 11, perceptual: 81, objectiveAlignment: 0.5, essential: false },
  { id: 'spatial-audio', kind: 'audio', cost: 10, perceptual: 74, objectiveAlignment: 0.35, essential: false },
  { id: 'environment-sim', kind: 'simulation', cost: 20, perceptual: 78, objectiveAlignment: mode === 'real-life' ? 0.7 : 0.45, essential: false },
]

export const qualityFrontier = (qualityPriority: number) => (qualityPriority >= 8 ? 88 : qualityPriority >= 5 ? 78 : 68)

export const acceptOptimization = (currentQuality: number, qualityLoss: number, frontier: number) => currentQuality - qualityLoss >= frontier

export const clampScore = clamp
