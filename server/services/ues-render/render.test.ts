import { describe, expect, it } from 'vitest'
import { UesRenderCore } from './core.js'
import { defaultPasses } from './passes.js'
import { topologicalPasses } from './schedule.js'

describe('UES render graph', () => {
  it('orders water after opaque and culls the far instance', () => {
    const order = topologicalPasses(defaultPasses()).map(item => item.id)
    expect(order.indexOf('water')).toBeGreaterThan(order.indexOf('opaque'))
    expect(order[0]).toBe('depth')
    expect(order.at(-1)).toBe('ui')
    const result = new UesRenderCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.drawn).toBe(1)
  })
})
