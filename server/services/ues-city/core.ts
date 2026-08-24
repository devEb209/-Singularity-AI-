import { DThesisCore } from '../d-thesis/core.js'
import { UesNavCore } from '../ues-nav/core.js'
import { UesWorldCore } from '../ues-world/core.js'
import { seedCensus } from './census.js'
import { buildDistricts } from './districts.js'
import { tickLives } from './lives.js'
import { identitiesPreserved, snapshotLives, transplant } from './persist.js'

export class UesCityCore {
  private world = new UesWorldCore()
  private nav = new UesNavCore()
  private thesis = new DThesisCore()

  simulate(seed: string, ticks = 8) {
    const world = this.world.generate(seed, 32, [10, 10])
    const compiled = this.nav.compile(world.terrain, world.roads, world.settlements)
    const districts = buildDistricts(world.terrain.size, world.settlements)
    let people = seedCensus(seed, world.settlements, districts, 96)
    const occupancy: { hour: number; moved: number; dormant: number; active: number }[] = []
    let hour = 6
    for (let tick = 0; tick < ticks; tick++) {
      const before = people.map(item => `${item.cell[0]},${item.cell[1]}`)
      people = tickLives(people, compiled.grid, districts, [10, 10], hour)
      hour = people[0]?.hour ?? ((hour + 1) % 24)
      occupancy.push({
        hour,
        moved: people.filter((item, index) => `${item.cell[0]},${item.cell[1]}` !== before[index]).length,
        dormant: people.filter(item => item.fidelity === 'dormant').length,
        active: people.filter(item => item.fidelity === 'full' || item.fidelity === 'high').length,
      })
    }
    const snapshot = snapshotLives(people)
    const moved = transplant(snapshot, districts)
    const dThesis = this.thesis.evaluate({
      objective: 'Censo urbano amostral com distritos, rotinas persistentes e LOD D-O15',
      constraints: ['não reivindicar milhões de agentes', 'dormant preserva identidade'],
      resources: ['CPU', 'navgrid', 'world 32'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 5, scalability: 9 },
    })
    return {
      format: 'ues-city-v1',
      scaleClaim: 'city-census-sample-not-millions',
      districts: districts.map(item => ({ id: item.id, kind: item.kind, cells: item.cells.length })),
      sampleSize: people.length,
      occupancy,
      persist: { identities: identitiesPreserved(snapshot, moved), count: moved.length },
      people: people.slice(0, 24).map(item => ({ id: item.id, cell: item.cell, fidelity: item.fidelity, lastAction: item.lastAction, occupation: item.occupation })),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: people.length === 96 && districts.length >= 5 && occupancy.some(item => item.moved > 0) && people.some(item => item.fidelity === 'dormant') && people.some(item => item.fidelity === 'full') && identitiesPreserved(snapshot, moved),
        millions: false,
      },
      limitations: ['96-agent census sample', 'Statistical LOD, not persistent autonomous lives at city scale'],
    }
  }
}
