import { DThesisCore } from '../d-thesis/core.js'
import { UesNavCore } from '../ues-nav/core.js'
import { UesWorldCore } from '../ues-world/core.js'
import { priceOf } from './economy.js'
import { inhabitTick, seedInhabitants } from './inhabit.js'

export class UesSocietyCore {
  private world = new UesWorldCore()
  private nav = new UesNavCore()
  private thesis = new DThesisCore()

  simulate(seed: string, ticks = 8) {
    const world = this.world.generate(seed, 32, [10, 10])
    const compiled = this.nav.compile(world.terrain, world.roads, world.settlements)
    let state = seedInhabitants(seed, world.settlements, 24)
    const history: { tick: number; active: number; dormant: number; prices: Record<string, number> }[] = []
    for (let tick = 0; tick < ticks; tick++) {
      state = { ...state, ...inhabitTick(state.people, state.minds, compiled.grid, world.settlements, state.stocks) }
      history.push({
        tick,
        active: state.people.filter(item => item.fidelity !== 'dormant').length,
        dormant: state.people.filter(item => item.fidelity === 'dormant').length,
        prices: Object.fromEntries(state.stocks.map(item => [item.id, priceOf(item)])),
      })
    }
    const dThesis = this.thesis.evaluate({
      objective: 'Habitar o mundo com população amostral, economia e fidelidade D-O15',
      constraints: ['não reivindicar milhares de NPCs', 'dormant preserva identidade'],
      resources: ['CPU', 'navgrid'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 5, scalability: 9 },
    })
    return {
      format: 'ues-society-v1',
      sampleSize: state.people.length,
      scaleClaim: 'population-sample-not-city-census',
      history,
      people: state.people.map(item => ({ id: item.id, cell: item.cell, fidelity: item.fidelity, lastAction: item.lastAction, occupation: item.occupation })),
      stocks: state.stocks,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp },
      verification: {
        valid: state.people.length === 24 && history.length === ticks && state.people.some(item => item.fidelity === 'dormant') && state.people.some(item => item.fidelity === 'full' || item.fidelity === 'high'),
        moved: state.people.some(item => item.lastAction && item.lastAction !== 'persist-only'),
      },
    }
  }
}
