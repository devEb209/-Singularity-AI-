import { describe, expect, it } from 'vitest'
import { bindCity } from './city-bind.js'
import { resolveContacts } from './contact-step.js'
import { compareEconomy } from './economy.js'
import { runHabitation } from './habitation.js'
import { inhabitWorld } from './inhabit.js'
import { compareObservers } from './multi-observer.js'
import { compareCityNav } from './nav-city.js'
import { liveWithClimate } from './need-climate.js'
import { editInStudio } from './studio-edit.js'
import { composeWithStructures } from './structure.js'
import { compareWeathering } from './weathering.js'

describe('RRW habitation', () => {
  it('places shelter from description without a mesh prefab', () => {
    const composed = composeWithStructures('oceano salgado com um humano e um abrigo')
    expect(composed.structures).toContain('shelter')
    expect(composed.meshPrefab).toBe(false)
  })

  it('conserves silica weathering and cellulose forage', () => {
    expect(compareWeathering().conserved).toBe(true)
    expect(compareWeathering().moved).toBe(true)
    expect(compareEconomy().conserved).toBe(true)
    expect(compareEconomy().foraged).toBe(true)
  })

  it('grasps the tool, conserves bounce and slows with friction', () => {
    const contacts = resolveContacts()
    expect(contacts.grasp).toBe(true)
    expect(contacts.momentumConserved).toBe(true)
    expect(contacts.slowed).toBe(true)
    expect(contacts.rigidbodyAsset).toBe(false)
  })

  it('lets thermal observers see fire more than photopic ones', () => {
    const observers = compareObservers()
    expect(observers.thermalSeesFireMore).toBe(true)
    expect(observers.framebufferFoundation).toBe(false)
  })

  it('walks a larger city grid without Recast', () => {
    const nav = compareCityNav()
    expect(nav.found).toBe(true)
    expect(nav.recast).toBe(false)
    expect(nav.size).toBe(24)
  })

  it('binds a city with same IDs, identities and work across the day', () => {
    const city = bindCity('oceano salgado com humanos e um abrigo', 96)
    expect(city.population).toBe(96)
    expect(city.identities).toBe(true)
    expect(city.sameIds).toBe(true)
    expect(city.workSeen).toBe(true)
    expect(city.consciousnessClaim).toBe(true)
    expect(city.uniqueFullMinds).toBe(false)
    expect(liveWithClimate().summerHotter).toBe(true)
  })

  it('edits a held session, settles phase and keeps the shelter after resume', () => {
    const studio = editInStudio('oceano salgado com um humano e um abrigo')
    expect(studio.hasShelter).toBe(true)
    expect(studio.settled).toBe(true)
    expect(studio.shelterSurvived).toBe(true)
    expect(studio.meshViewport).toBe(false)
    expect(studio.recomposed).toBe(false)
  })

  it('runs habitation without closing Genesis', () => {
    const result = runHabitation('oceano salgado com fogo, floresta, um humano e um abrigo')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.completeReality).toBe(false)
    expect(result.inhabited.nav.found).toBe(true)
    expect(inhabitWorld().verification.genesisClosed).toBe(false)
  })
})
