import { describe, expect, it } from 'vitest'
import { decide } from './behavior.js'
import { NmnCore, warCast, warEvent } from './core.js'
import { applyFidelity } from './fidelity.js'
import { perceive } from './mind.js'

describe('NMN contextual behavior', () => {
  it('produces different actions for different people in the same invasion', () => {
    const result = new NmnCore().simulate({ characters: warCast('p'), event: warEvent(), ticks: 1 })
    const byName = Object.fromEntries(result.characters.map(item => [item.name, item.action]))
    expect(['evacuate-with-family', 'protect-family']).toContain(byName.Amina)
    expect(byName.Bento).toBe('search-missing')
    expect(byName.Célia).toBe('aid-wounded')
    expect(byName.Dario).toMatch(/defend|help-evacuation/)
    expect(byName.Eva).toMatch(/hide|freeze/)
    expect(byName.Farid).toBe('travel-to-family')
    expect(result.distinctActions.length).toBeGreaterThanOrEqual(5)
    expect(result.verification.scriptedGlobalReaction).toBe(false)
    expect(result.consciousnessClaim).toBe(false)
  })

  it('keeps a denier on routine under rumor and changes after witnessed evidence', () => {
    const [gita] = warCast('p').filter(item => item.id === 'npc-g')
    const rumor = warEvent()
    rumor.evidence = 0.12
    rumor.rumorStrength = 0.8
    const first = decide(structuredClone(gita), rumor)
    expect(first.action).toBe('continue-routine')
    const invasion = decide(structuredClone(gita), warEvent())
    expect(invasion.action).not.toBe('continue-routine')
    expect(invasion.perceived.awareness).toBe('witnessed')
  })

  it('forbids omniscience: an unseen event stays unknown', () => {
    const [amina] = warCast('p')
    amina.location = 'farm'
    const perceived = perceive(amina, warEvent('city-center'))
    expect(perceived.awareness).toBe('unknown')
    expect(decide(amina, warEvent('city-center')).action).toBe('continue-routine')
  })

  it('rejects loot when honor is intact', () => {
    const [dario] = warCast('p').filter(item => item.id === 'npc-d')
    dario.values.push('honor')
    dario.personality.greed = 0.95
    const event = warEvent()
    event.opportunity = 1
    expect(decide(dario, event).ranked.find(item => item.action === 'loot')?.score).toBeLessThan(0)
  })

  it('preserves identity when D-O15 lowers fidelity', () => {
    const [amina] = warCast('p')
    const change = applyFidelity(amina, 0.1)
    expect(change.to).toBe('dormant')
    expect(change.preservedIdentity).toBe('Amina')
    expect(change.continuity).toBe(true)
    expect(amina.values).toContain('care')
  })

  it('does not claim a scripted revolt and can detect unrest from collective state', () => {
    const characters = warCast('p').map(item => ({ ...item, needs: { ...item.needs, resources: 0.1, safety: 0.2 }, lastAction: 'flee' as const }))
    characters[3].knowledge.skills.combat = 0.9
    characters[3].personality.courage = 0.9
    characters.forEach(item => item.knowledge.facts.push({ id: 'r', content: 'rumor', confidence: 0.3, source: 'rumor', domain: 'current-event' }))
    const event = warEvent()
    event.scarcity = 0.8
    const emergence = new NmnCore().simulate({ characters, event, ticks: 1 }).emergence
    expect(emergence.scriptedRevolt).toBe(false)
  })
})
