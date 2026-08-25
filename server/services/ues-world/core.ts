import { DThesisCore } from '../d-thesis/core.js'
import { generateRoads, pickSettlementSeeds } from './roads.js'
import { buildingMask, generateSettlements } from './settlements.js'
import { allChunks, streamChunks } from './streaming.js'
import { generateTerrain } from './terrain.js'
import { generateVegetation } from './vegetation.js'

export class UesWorldCore {
  private thesis = new DThesisCore()

  generate(seed: string, size = 32, viewer: [number, number] = [8, 8]) {
    const terrain = generateTerrain(seed, size)
    const seeds = pickSettlementSeeds(terrain)
    const roads = generateRoads(terrain, seeds)
    const settlements = generateSettlements(terrain, roads)
    const blocked = buildingMask(terrain, settlements).map((row, z) => row.map((building, x) => building || roads.cells[z][x]))
    const vegetation = generateVegetation(terrain, blocked)
    const stream = streamChunks(terrain.size, terrain.chunkSize, viewer, 12)
    const dThesis = this.thesis.evaluate({
      objective: `Gerar mundo semântico com estradas, assentamentos e vegetação a partir de ${seed}`,
      constraints: ['determinístico', 'sem provider', 'streaming por chunk'],
      resources: ['CPU', 'heightfield'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 8 },
    })
    const buildings = settlements.flatMap(item => item.buildings)
    return {
      format: 'ues-semantic-world-v1',
      terrain,
      roads,
      settlements,
      vegetation,
      streaming: stream,
      chunks: allChunks(terrain.size, terrain.chunkSize),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp, dO15: dThesis.dO15 },
      verification: {
        valid: terrain.verification.finite && roads.verification.connected && settlements.length > 0 && buildings.length > 0,
        settlements: settlements.length,
        buildings: buildings.length,
        plants: vegetation.length,
        roadCells: roads.cells.flat().filter(Boolean).length,
        residentChunks: stream.resident.length,
      },
      absolutePerfectionClaim: false,
      photorealismClaim: false,
    }
  }
}
