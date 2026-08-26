import { describe, expect, it } from 'vitest'
import { capabilityDomains, emergingDomains, universalCapabilities } from './universal-capabilities.js'

describe('Universal Capability Expansion', () => {
  it('registers exactly 380 new capabilities beyond the original systems', () => {
    expect(capabilityDomains).toHaveLength(19)
    expect(universalCapabilities).toHaveLength(380)
    expect(capabilityDomains.every(domain => domain.capabilities.length === 20)).toBe(true)
  })

  it('tracks the 14 newly proposed domains without pretending they are implemented', () => {
    expect(emergingDomains).toHaveLength(14)
    expect(emergingDomains.every(domain => domain.status === 'discovery')).toBe(true)
  })

  it('uses stable unique IDs and preserves safety policy', () => {
    expect(new Set(universalCapabilities.map(item => item.id)).size).toBe(380)
    expect(capabilityDomains.find(domain => domain.id === 'health')?.safety).toBe('high-stakes-informational')
    expect(capabilityDomains.find(domain => domain.id === 'cybersecurity')?.safety).toBe('authorized-only')
  })
})
