import { describe, expect, it } from 'vitest'
import { priceOf, seedStocks, tickStocks, trade } from './economy.js'
import { UesSocietyCore } from './core.js'

describe('UES society and economy', () => {
  it('raises price when stock is scarce', () => {
    const cheap = priceOf({ id: 'food', amount: 80, demand: 20 })
    const dear = priceOf({ id: 'food', amount: 2, demand: 20 })
    expect(dear).toBeGreaterThan(cheap)
  })

  it('transfers stock without going negative', () => {
    const stocks = seedStocks()
    const result = trade({ food: 0, water: 0, timber: 0, medicine: 0, tools: 0 }, { food: 3, water: 0, timber: 0, medicine: 0, tools: 0 }, 'food', 2, stocks)
    expect(result.transferred).toBe(2)
    expect(result.seller.food).toBe(1)
    expect(tickStocks(stocks).every(item => item.amount >= 0)).toBe(true)
  })

  it('ticks a population sample with mixed D-O15 fidelity', () => {
    const result = new UesSocietyCore().simulate('living-harbor', 6)
    expect(result.verification.valid).toBe(true)
    expect(result.sampleSize).toBe(24)
    expect(result.scaleClaim).toContain('sample')
    expect(result.people.some(item => item.fidelity === 'dormant')).toBe(true)
  })
})
