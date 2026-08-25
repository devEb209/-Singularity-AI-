import { acceptOptimization, chooseEquivalent, qualityFrontier } from '../real-life/optimize.js'
import type { Representation } from '../real-life/types.js'
import { profile } from '../ues-profiler/measure.js'

export const optimizeLoop = (candidates: Representation[], qualityPriority = 8) => {
  const frontier = qualityFrontier(qualityPriority)
  const before = profile([
    { name: 'select', budgetMs: 20, fn: () => { chooseEquivalent(candidates) } },
  ])
  const choice = chooseEquivalent(candidates)
  const selected = choice.selected
  const qualityLoss = selected ? Math.max(0, Math.max(...candidates.map(item => item.perceptual)) - selected.perceptual) : 100
  const accepted = selected ? acceptOptimization(selected.perceptual + qualityLoss, qualityLoss, frontier) : false
  const after = profile([
    { name: 'apply', budgetMs: 20, fn: () => { void selected } },
  ])
  return {
    format: 'ues-optimize-loop-v1',
    frontier,
    choice,
    accepted,
    rollback: !accepted,
    before,
    after,
    measured: true,
    verification: { valid: Boolean(selected) && before.verification.valid, qualityPreserved: accepted },
    rule: 'Rollback when the measured/estimated quality crosses the D-O15 frontier.',
  }
}
