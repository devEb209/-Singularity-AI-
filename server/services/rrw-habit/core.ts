import { DThesisCore } from '../d-thesis/core.js'
import { runHabitation } from '../rrw/habitation.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwHabitCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const habitation = runHabitation(prompt)
    const kernel = runKernel('Habitar a realidade retida: estrutura, cidade, forragem, estúdio e D-O15', 'rrw.habit', ['rrw', 'session'], [
      { module: 'knowledge', accepted: habitation.inhabited.structures.includes('shelter'), note: 'structure from description' },
      { module: 'd-thesis', accepted: !habitation.verification.uniqueFullMinds, note: 'no consciousness / no million minds' },
      { module: 'genesis', accepted: habitation.verification.valid && !habitation.verification.genesisClosed, note: 'inhabited, not closed' },
      { module: 'represent', accepted: !habitation.studio.meshViewport, note: 'not a mesh viewport' },
      { module: 'd-o15', accepted: habitation.inhabited.city.sameIds, note: 'same city ids' },
      { module: 'execute', accepted: habitation.studio.shelterSurvived && habitation.inhabited.nav.found && habitation.inhabited.economy.conserved, note: 'edit + walk + forage' },
      { module: 'verify', accepted: !habitation.verification.traditionalPipeline && habitation.inhabited.contacts.momentumConserved, note: 'not a renamed engine' },
      { module: 'refine', accepted: habitation.studio.settled && !habitation.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Habitar e editar a realidade RRW sem copiar cidade-de-engine',
      constraints: ['sem consciência', 'sem Recast', 'sem prefab de mesh', 'sem fechar Gênesis no papel'],
      resources: ['structure', 'city', 'studio-edit', 'D-O15'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 10 },
    })
    return {
      ...habitation,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        ...habitation.verification,
        valid: kernel.verification.valid && habitation.verification.valid,
      },
    }
  }
}
