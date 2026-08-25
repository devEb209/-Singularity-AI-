import { measure } from '../ues-profiler/measure.js'
import type { VfxGate } from './types.js'

export const gate = (name: string, budgetMs: number, fn: () => void): VfxGate => {
  const section = measure(name, budgetMs, fn)
  return { name, budgetMs, ms: section.ms, overBudget: section.overBudget }
}
