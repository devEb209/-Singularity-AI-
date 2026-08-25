import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parsePuterRegistry } from './parse-puter-registry.js'

const registry = parsePuterRegistry(readFileSync(new URL('../puter-models.txt', import.meta.url), 'utf8'))

describe('official Puter model snapshot parser', () => {
  it('imports the complete declared snapshot', () => {
    expect(registry.declared).toBe(879)
    expect(registry.models).toHaveLength(879)
  })

  it('preserves exact provider and model identifiers', () => {
    expect(registry.models.every(model => model.id.length > 0 && model.provider.length > 0)).toBe(true)
    const keys = registry.models.map(model => `${model.provider}\u0000${model.id}`)
    expect(new Set(keys).size).toBe(879)
  })

  it('does not manufacture benchmark tiers from catalog metadata', () => {
    expect(registry.models.every(model => !('tier' in model))).toBe(true)
  })
})
