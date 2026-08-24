import { DThesisCore } from '../d-thesis/core.js'
import { hashSeed } from '../ues-shared/math.js'
import { ingestSpatial } from '../ues-space/ingest.js'
import { biomeAt } from './biome.js'
import { climateField } from './climate.js'
import { partition, reconstruct } from './fidelity.js'
import { rockAt } from './geology.js'
import { heightField } from './height.js'
import { accumulate, lakes, rivers } from './hydrology.js'
import { observableCatalog } from './universe.js'

export class UesPlanetCore {
  private thesis = new DThesisCore()

  generate(seedText = 'earth-like', size = 36, seaLevel = 0, viewer: [number, number] = [18, 18]) {
    const seed = hashSeed(seedText)
    const heights = heightField(seed, size, seaLevel)
    const hydro = accumulate(heights)
    const riverCells = rivers(heights, hydro.acc)
    const riverMask = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
    for (const [x, z] of riverCells) riverMask[z][x] = true
    const climate = climateField(heights, riverMask)
    const biomes = climate.map((row, z) => row.map((cell, x) => biomeAt(heights[z][x], cell.temperature, cell.moisture)))
    const geology = climate.map((row, z) => row.map((cell, x) => rockAt(heights[z][x], cell.temperature)))
    const land = heights.flat().filter(h => h > 0).length
    const ocean = heights.flat().length - land
    const fidelity = partition(size, viewer)
    const sample: [number, number] = [2, 2]
    const match = reconstruct(seed, sample[0], sample[1], size, seaLevel) === heights[sample[1]][sample[0]]
    const ingest = ingestSpatial({
      id: 'height-internal',
      kind: 'height',
      size,
      cells: heights,
      license: 'CC0',
      source: 'internal-geophysics',
      fetchedRemote: false,
    })
    const dThesis = this.thesis.evaluate({
      objective: `Emular planeta como conhecimento espacial a partir de ${seedText}`,
      constraints: ['não reivindicar NASA', 'não carregar o planeta inteiro em fidelidade máxima', 'D-O15 de representação'],
      resources: ['CPU', 'quadtree lógica', 'regras geofísicas'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 5, scalability: 10 },
    })
    return {
      format: 'ues-planet-v1',
      size,
      land,
      ocean,
      rivers: riverCells.length,
      lakes: lakes(heights).length,
      biomes: [...new Set(biomes.flat())],
      geology: [...new Set(geology.flat())],
      fidelity,
      reconstruct: match,
      ingest: ingest.verification,
      universe: observableCatalog(80),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: land > 0 && ocean > 0 && riverCells.length > 0 && match && ingest.verification.valid && fidelity.full > 0 && fidelity.dormant > 0,
        nasa: false,
        atomSim: false,
      },
      limitations: ['Earth-like geophysical rules', 'Not live GIS/NASA ingest', 'Not atom-scale Earth'],
      grid: { heights, biomes, riverMask },
    }
  }
}
