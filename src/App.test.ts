import { describe, expect, it } from 'vitest'
import { navigationItems } from './App'
import { advancedIds } from './AdvancedViews'
import { creativeIds } from './CreativeViews'
import { platformIds } from './PlatformViews'

describe('Singularity information architecture', () => {
  it('provides at least 39 product areas', () => {
    expect(navigationItems.length).toBeGreaterThanOrEqual(39)
  })

  it('uses unique stable route identifiers', () => {
    const ids = navigationItems.map(item => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('maps every specialized view to a navigation destination', () => {
    const routes = new Set(navigationItems.map(item => item.id))
    const specialized = [...advancedIds, ...creativeIds, ...platformIds]
    expect(specialized.every(id => routes.has(id))).toBe(true)
  })

  it('does not overlap specialized view handlers', () => {
    const specialized = [...advancedIds, ...creativeIds, ...platformIds]
    expect(new Set(specialized).size).toBe(specialized.length)
  })
})
