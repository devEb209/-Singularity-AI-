import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { earthLaws, interpretGrid, type FieldSample, type WorldLaws } from './interpret.js'

const earthFixture = (): FieldSample[] => [
  { elevation: 0.05, moisture: 0.8, temperature: 0.7, latitude: 0.05 },
  { elevation: 0.85, moisture: 0.3, temperature: 0.25, latitude: 0.4 },
  { elevation: 0.2, moisture: 0.1, temperature: 0.75, latitude: 0.2 },
  { elevation: 0.15, moisture: 0.45, temperature: 0.5, latitude: 0.45 },
]

export class UesWorldKnowledgeCore {
  private thesis = new DThesisCore()

  process(mode: 'earth' | 'alien' = 'earth') {
    const laws: WorldLaws = mode === 'alien' ? { treeLine: 0.4, desertMoisture: 0.5, iceTemp: 0.55 } : earthLaws
    const earth = interpretGrid(earthFixture(), earthLaws)
    const world = interpretGrid(earthFixture(), laws)
    const kernel = runKernel('Terra é referência estrutural, não teto do mundo', 'ues.world-knowledge', ['planet', 'real-life'], [
      { module: 'knowledge', accepted: true, note: 'fields not textures' },
      { module: 'd-thesis', accepted: true, note: 'same pipeline any world' },
      { module: 'world-knowledge', accepted: earth.biomes.includes('rainforest') && earth.biomes.includes('desert'), note: 'earth coherence' },
      { module: 'represent', accepted: true, note: 'semantic cells' },
      { module: 'd-o15', accepted: true, note: 'no full planet store' },
      { module: 'execute', accepted: world.cells.length === earth.cells.length, note: 'same grid' },
      { module: 'verify', accepted: mode === 'alien' ? world.laws === 'custom' : world.biomes.includes('temperate') || world.biomes.includes('alpine'), note: 'laws switch' },
      { module: 'refine', accepted: true, note: 'NASA remains adapter' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Transformar relevo/clima/solo/água em conhecimento, e reusar para mundos novos',
      constraints: ['não fingir dataset NASA', 'Terra não limita'],
      resources: ['field interpreter'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-world-knowledge-v1',
      mode,
      earth: { biomes: earth.biomes, cells: earth.cells.length },
      world: { biomes: world.biomes, laws: world.laws, cells: world.cells.length },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && earth.biomes.length >= 3,
        nasaRequired: false,
        earthIsLimit: false,
      },
      limitations: ['Structural field interpreter', 'Not a live Earth reconstruction'],
    }
  }
}
