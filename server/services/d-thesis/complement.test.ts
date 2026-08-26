import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SQLiteStore } from '../../repositories/sqlite-store.js'
import { ArtifactGraphService } from '../artifact-graph.js'
import { DThesisComplement } from './complement.js'
import { DThesisService } from './service.js'

const dirs: string[] = []
afterEach(async () => Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))))

describe('Tese dos D complement', () => {
  it('refuses a graphics-only reading and runs Real-Life + NMN + autonomy together', () => {
    const result = new DThesisComplement().evaluate({
      objective: 'Criar um jogo de cidade viva com invasão, economia e NPCs contextuais',
      constraints: ['realismo não obrigatório'],
      resources: ['CPU'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 7 },
      mode: 'cartoon',
      hardware: 'low',
      includeWarScenario: true,
      projectId: 'p',
    })
    expect(result.replacesOriginalThesis).toBe(false)
    expect(result.notLimitedToGraphicsOrPhysics).toBe(true)
    expect(result.verification.graphicsOnlyInterpretation).toBe(false)
    expect(result.realLife.domains.available).toBeGreaterThan(30)
    expect(result.summary.npcActions).toBeGreaterThanOrEqual(5)
    expect(result.autonomy.intention.silenceIsNotUnlimitedAuthorization).toBe(true)
  })

  it('persists a complement artifact', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'comp-'))
    dirs.push(dir)
    const store = new SQLiteStore(join(dir, 'db'))
    const project = store.createProject('u', 'World', '')
    const service = new DThesisService(store, new ArtifactGraphService(store), join(dir, 'uploads'))
    const result = await service.complement('u', {
      projectId: project.id,
      name: 'world',
      objective: 'Simular sociedade e clima de uma cidade',
      constraints: [],
      resources: ['CPU'],
      priorities: { quality: 8, performance: 7, safety: 9, cost: 4, scalability: 7 },
    })
    expect(result.artifact.status).toBe('verified')
    expect(result.artifact.type).toBe('analysis.d-thesis-complement')
    expect(result.evaluation.dThesis.scope.notLimitedToGraphicsOrPhysics).toBe(true)
    expect(result.evaluation.notLimitedToGraphicsOrPhysics).toBe(true)
    store.close()
  })
})
