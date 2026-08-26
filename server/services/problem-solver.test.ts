import { describe, expect, it } from 'vitest'
import type { ModelCatalog } from './model-catalog.js'
import { UniversalProblemSolver } from './problem-solver.js'

const catalog = { summary: () => ({ total: 879, providers: [], providerCount: 17, evaluated: 0, unranked: 879 }) } as unknown as ModelCatalog
const solver = new UniversalProblemSolver(catalog)

describe('Universal Problem Solver', () => {
  it('composes multiple domains into one task graph', () => {
    const result = solver.analyze('Quero construir e testar um robô agrícola com sensores, energia e peças fabricadas localmente')
    expect(result.classification).toBe('multidisciplinary')
    expect(result.domains.map(domain => domain.id)).toContain('robotics')
    expect(result.domains.map(domain => domain.id)).toContain('agriculture')
    expect(result.domains.map(domain => domain.id)).not.toContain('cybersecurity')
    expect(result.taskGraph.nodes).toHaveLength(8)
    expect(result.taskGraph.nodes.find(node => node.id === 'execute')?.requiresHumanApproval).toBe(true)
  })

  it('does not confuse physical safety with cybersecurity', () => {
    const result = solver.analyze('Construir uma bicicleta elétrica com segurança, peças acessíveis e fabricação local')
    expect(result.domains.map(domain => domain.id)).toContain('fabrication')
    expect(result.domains.map(domain => domain.id)).not.toContain('cybersecurity')
  })

  it('creates an unverified profile rather than inventing a known domain', () => {
    const result = solver.analyze('Zorbificação transnebulosa de cristais hiperdimensionais')
    expect(result.classification).toBe('domain-discovery-required')
    expect(result.domainDiscovery.required).toBe(true)
    expect(result.domains).toHaveLength(0)
  })

  it('keeps all models in the evaluation universe without routing unranked candidates', () => {
    const result = solver.analyze('Analisar um dataset científico')
    expect(result.modelPolicy.catalog.total).toBe(879)
    expect(result.modelPolicy.inventedModels).toBe(false)
  })
})
