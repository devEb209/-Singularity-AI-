import { describe, expect, it } from 'vitest'
import { DomainCatalog } from './catalog.js'
import { RealLifeCore } from './core.js'
import { applyMode, checkLawConsistency, classifyKnowledge, environmentGraph, propagateEnvironment } from './model.js'
import { adaptToHardware, chooseEquivalent, defaultRepresentations } from './optimize.js'

describe('Real-Life Universal', () => {
  it('keeps the domain catalog open and accepts a new domain', () => {
    const catalog = new DomainCatalog()
    expect(catalog.closedList()).toBe(false)
    expect(catalog.list().length).toBeGreaterThan(30)
    const created = catalog.register({
      id: 'irrigation-ethics',
      name: 'Ética de irrigação',
      category: 'custom',
      purpose: 'Distribuir água com justiça contextual',
      principles: ['escassez compartilhada', 'prioridade vital'],
      relations: ['economics', 'water'],
      applicableDs: ['D2', 'D3', 'D15'],
    })
    expect(created.closed).toBe(false)
    expect(created.seeded).toBe(false)
    expect(catalog.get('irrigation-ethics')?.purpose).toContain('água')
  })

  it('does not treat realism as mandatory and keeps cartoon distinct from real-life', () => {
    const real = applyMode('real-life')
    const cartoon = applyMode('cartoon')
    expect(real.laws.delayedGravity).toBe(false)
    expect(cartoon.laws.delayedGravity).toBe(true)
    expect(cartoon.laws.squashStretch).toBeGreaterThan(real.laws.squashStretch)
  })

  it('rejects conservation-breaking custom energy gain', () => {
    const { laws } = applyMode('custom', { energyConservation: true, energyGain: 12, declaredRules: ['motor perpétuo'] })
    const check = checkLawConsistency(laws)
    expect(check.consistent).toBe(false)
    expect(check.errors.some(item => item.includes('energyConservation'))).toBe(true)
  })

  it('propagates an environment perturbation across coupled systems', () => {
    const result = propagateEnvironment(environmentGraph(), 'climate', 0.4)
    expect(result.affected.length).toBeGreaterThan(2)
    expect(result.affected.some(item => item.id === 'vegetation' || item.id === 'water')).toBe(true)
  })

  it('classifies unsourced claims as speculation and refuses automatic facts', () => {
    expect(classifyKnowledge([]).usableAsFact).toBe(false)
    expect(classifyKnowledge([]).confidence).toBe('speculation')
    expect(classifyKnowledge([
      { title: 'A', statement: 'x', independent: true },
      { title: 'B', statement: 'x', independent: true, tested: true },
    ]).usableAsFact).toBe(true)
  })

  it('prefers a cheaper perceptually equivalent representation', () => {
    const choice = chooseEquivalent(defaultRepresentations('real-life').filter(item => item.kind === 'geometry'))
    expect(choice.selected?.id).toBe('clustered-geometry')
    expect(choice.reason).toContain('cheaper')
  })

  it('adapts hardware by redistributing fidelity instead of only lowering graphics', () => {
    const adapted = adaptToHardware('diálogo de personagens em uma cidade', 'low', defaultRepresentations('real-life'))
    expect(adapted.notJustLowerGraphics).toBe(true)
    expect(adapted.kept.some(item => item.kind === 'npc' || item.id.includes('npc'))).toBe(true)
    expect(adapted.dropped.some(item => item.kind === 'particle') || adapted.substituted.length > 0).toBe(true)
  })

  it('composes economics without collapsing into a mesh-only interpretation', () => {
    const result = new RealLifeCore().compose({
      objective: 'Modelar economia urbana e comportamento coletivo de um mercado',
      mode: 'real-life',
      hardware: 'balanced',
      phenomenon: 'escassez de grãos após seca',
      perturbation: { node: 'climate', magnitude: 0.3 },
    })
    expect(result.notLimitedToGraphicsOrPhysics).toBe(true)
    expect(result.closedModuleList).toBe(false)
    expect(result.realismMandatory).toBe(false)
    expect(result.domains.selected.some(item => ['economics', 'cities', 'collective-behavior', 'climatology', 'climate'].includes(item.id))).toBe(true)
    expect(result.knowledge.rules.length).toBeGreaterThan(0)
    expect(result.graphics.photorealismIsNotTheGoal).toBe(true)
    expect(result.physics.consistency.consistent).toBe(true)
    expect(result.verification.graphicsOnlyInterpretation).toBe(false)
    expect(result.dThesis.gpp.absolutePerfectionClaim).toBe(false)
  })
})
