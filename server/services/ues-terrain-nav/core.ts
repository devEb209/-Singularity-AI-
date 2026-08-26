import { DThesisCore } from '../d-thesis/core.js'
import { heightField } from '../ues-planet/height.js'
import { hashSeed } from '../ues-shared/math.js'
import { pathPlanet } from './heightmesh.js'

export class UesTerrainNavCore {
  private thesis = new DThesisCore()

  process(seedText = 'earth-like') {
    const heights = heightField(hashSeed(seedText), 36)
    const compiled = pathPlanet(heights)
    const dThesis = this.thesis.evaluate({
      objective: 'Extrair malha caminhável de um heightfield planetário e ligar dois pontos de terra',
      constraints: ['não reivindicar Recast', 'água e encosta íngreme não são walkable'],
      resources: ['planet height', 'A*'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-terrain-nav-v1',
      walkable: compiled.cells,
      rivers: compiled.rivers,
      path: { found: compiled.path.found, cells: compiled.path.path.length, start: compiled.start, goal: compiled.goal },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: compiled.cells > 20 && compiled.path.found && compiled.path.path.length >= 2,
        recast: false,
      },
      limitations: ['Heightfield slope + river mask', 'Not Recast/Detour from arbitrary 3D'],
    }
  }
}
