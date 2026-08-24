import { describe, expect, it } from 'vitest'
import { AutonomyCore } from './core.js'
import { classifyClaim } from './knowledge.js'
import { DECISION_WINDOW_MS } from './types.js'

describe('UES autonomous development', () => {
  it('parses intention levels and refuses to violate an absolute objective', () => {
    const core = new AutonomyCore()
    const project = core.create({
      userId: 'u',
      projectId: 'p',
      name: 'game',
      intent: 'Criar um jogo de mundo aberto obrigatório com salvamento local',
      constraints: ['Nunca executar código no host', 'Preferiria estilo cartoon', 'Você decide o orçamento de partículas'],
    })
    expect(project.items.some(item => item.level === 1)).toBe(true)
    expect(project.items.some(item => item.level === 2 && /nunca/.test(item.text.toLowerCase()))).toBe(true)
    expect(project.items.some(item => item.level === 3)).toBe(true)
    expect(project.items.some(item => item.level === 4)).toBe(true)
    expect(() => core.control(project, 'alter', 'remover objetivo absoluto de salvamento')).toThrow(/absolute|imut|Cannot violate/i)
  })

  it('does not treat silence as authorization for a non-delegated decision', () => {
    const core = new AutonomyCore()
    const project = core.create({ userId: 'u', projectId: 'p', name: 'app', intent: 'Construir um editor de documentos' })
    let current = project
    for (let i = 0; i < 8 && current.stage !== 'awaiting-user'; i++) current = core.tick(current)
    expect(current.stage).toBe('awaiting-user')
    expect(current.window?.delegated).toBe(false)
    const expired = core.tick(structuredClone(current), Date.parse(current.window!.expiresAt) + 1)
    expect(expired.stage).toBe('blocked')
    expect(expired.window?.status).toBe('expired-blocked')
  })

  it('applies a delegated decision after the 5m30s window', () => {
    const core = new AutonomyCore()
    const project = core.create({
      userId: 'u',
      projectId: 'p',
      name: 'app',
      intent: 'Construir um editor. Você decide a estratégia de implementação.',
    })
    expect(project.items.some(item => item.level === 4)).toBe(true)
    let current = project
    for (let i = 0; i < 12 && current.stage !== 'complete'; i++) current = core.tick(current)
    expect(current.stage).not.toBe('blocked')
    expect(DECISION_WINDOW_MS).toBe(330_000)
  })

  it('never auto-promotes unsourced internet-like text into a fact', () => {
    const item = classifyClaim({ claim: 'fato: a cidade tem 2 milhões de habitantes', sources: [], inferred: true })
    expect(item.usableAsFact).toBe(false)
    expect(item.classification).toBe('hypothesis')
  })

  it('keeps project data isolated from global training', () => {
    const core = new AutonomyCore()
    const project = core.create({ userId: 'u1', projectId: 'p1', name: 'a', intent: 'Simular uma cidade' })
    const other = core.create({ userId: 'u2', projectId: 'p2', name: 'b', intent: 'Simular uma cidade' })
    expect(project.isolation.usedForGlobalTraining).toBe(false)
    expect(project.isolation.tenant).not.toBe(other.isolation.tenant)
    const evaluation = core.evaluate(project)
    expect(evaluation.verification.trainingSeparation).toBe(true)
    expect(evaluation.anyViableThingMeans).toContain('not magic')
  })
})
