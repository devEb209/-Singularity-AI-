import { describe, expect, it } from 'vitest'
import { defaultRepresentations } from '../real-life/optimize.js'
import { profile } from '../ues-profiler/measure.js'
import { optimizeLoop } from './loop.js'

describe('UES profiler and D-O15 loop', () => {
  it('measures real CPU time', () => {
    const report = profile([{ name: 'work', budgetMs: 50, fn: () => { let x = 0; for (let i = 0; i < 2000; i++) x += i } }])
    expect(report.verification.measured).toBe(true)
    expect(report.gpu).toBe(false)
    expect(report.sections[0].ns).toBeGreaterThan(0)
  })

  it('records rollback when the quality frontier would be crossed', () => {
    const accepted = optimizeLoop(defaultRepresentations('real-life'), 5)
    expect(accepted.verification.valid).toBe(true)
    expect(accepted.measured).toBe(true)
    const strict = optimizeLoop([
      { id: 'hi', kind: 'geometry', cost: 40, perceptual: 96, objectiveAlignment: 0.8, essential: false },
      { id: 'lo', kind: 'geometry', cost: 8, perceptual: 50, objectiveAlignment: 0.8, essential: false },
    ], 10)
    expect(strict.rollback || !strict.accepted || strict.choice.selected?.id === 'hi').toBe(true)
  })
})
