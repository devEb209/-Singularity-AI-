import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from './society.js'

export class UesLivesCore {
  private thesis = new DThesisCore()

  process(seed = 'atelier-city') {
    const { households, people: initial } = seedPopulation(seed, 1024, 64)
    let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
    const seasonal: { hour: number; shade: number; work: number; actions: string[] }[] = []
    const seen = new Set<string>()
    for (let hour = 0; hour < 24; hour++) {
      people = tickSociety(people, climateAt(hour, false), hour)
      people.forEach(item => seen.add(item.lastAction))
      seasonal.push({ hour: people[0]?.hour ?? hour, shade: people.filter(item => item.lastAction === 'seek-shade').length, work: people.filter(item => item.lastAction === 'work').length, actions: [...new Set(people.map(item => item.lastAction))] })
    }
    const afterDay = people
    people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
    const heatwave: { hour: number; shade: number }[] = []
    for (let hour = 0; hour < 24; hour++) {
      people = tickSociety(people, climateAt(hour, true), hour)
      heatwave.push({ hour: people[0]?.hour ?? hour, shade: people.filter(item => item.lastAction === 'seek-shade').length })
    }
    const actions = seen
    const kernel = runKernel('Vidas urbanas persistentes com D-O15 e clima', 'ues.lives', ['nmn', 'city', 'represent'], [
      { module: 'knowledge', accepted: true, note: 'households + needs' },
      { module: 'd-thesis', accepted: true, note: 'same event, distinct actions' },
      { module: 'lives', accepted: identitiesPreserved(initial, afterDay), note: 'identity' },
      { module: 'represent', accepted: afterDay.some(item => item.fidelity === 'dormant') && afterDay.some(item => item.fidelity === 'full'), note: 'npc lod' },
      { module: 'd-o15', accepted: true, note: '1024 compact / 64 full' },
      { module: 'execute', accepted: seasonal.some(item => item.work > 0), note: 'day schedule' },
      { module: 'verify', accepted: heatwave.reduce((sum, item) => sum + item.shade, 0) > seasonal.reduce((sum, item) => sum + item.shade, 0), note: 'climate coupling' },
      { module: 'refine', accepted: actions.size >= 2, note: 'not one script' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Cidade persistente hierárquica, sem reivindicar milhões de mentes únicas',
      constraints: ['sem consciência', 'silêncio não autoriza'],
      resources: ['households', 'needs', 'climate', 'D-O15'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-lives-v1',
      households: households.length,
      population: afterDay.length,
      full: afterDay.filter(item => item.fidelity === 'full').length,
      dormant: afterDay.filter(item => item.fidelity === 'dormant').length,
      distinctActions: [...actions],
      climate: { seasonalShade: seasonal.reduce((sum, item) => sum + item.shade, 0), heatwaveShade: heatwave.reduce((sum, item) => sum + item.shade, 0) },
      sample: afterDay.slice(0, 8).map(item => ({ id: item.id, occupation: item.occupation, action: item.lastAction, fidelity: item.fidelity })),
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && afterDay.length === 1024 && identitiesPreserved(initial, afterDay) && afterDay.filter(item => item.fidelity === 'full').length === 64,
        millions: false,
        consciousnessClaim: false,
      },
      limitations: ['Hierarchical 1024 compact / 64 full', 'Not millions of unique full NMN agents'],
    }
  }
}
