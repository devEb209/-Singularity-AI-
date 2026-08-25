import { describe, expect, it } from 'vitest'
import { SnbOrchestratorCore } from './core.js'
import { canonicalTickets } from './tickets.js'

describe('SNB Genesis orchestrator', () => {
  it('runs internal 3D automatically and only issues canonical pending Puter tickets', () => {
    const tickets = canonicalTickets()
    expect(tickets.length).toBeGreaterThan(1)
    expect(new Set(tickets.map(item => item.provider)).size).toBeGreaterThan(1)
    expect(tickets.every(item => item.modelId.length > 0 && item.status === 'pending-client')).toBe(true)
    const result = new SnbOrchestratorCore().process('ponte de pedra e recorte esferico')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.automaticInternal).toBe(true)
    expect(result.verification.automaticPuter).toBe(false)
    expect(result.internals.solid.valid).toBe(true)
  })
})
