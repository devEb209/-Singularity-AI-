import { DThesisCore } from '../d-thesis/core.js'
import { pathBetween, rungs, stack } from './ladder.js'
import { transition } from './transition.js'

export class UesScaleCore {
  private thesis = new DThesisCore()

  process(worldId = 'earth-like') {
    const descent = transition('space', 'object', worldId, -23.55, -46.63)
    const hop = transition('planet', 'city', worldId, -23.55, -46.63)
    const dThesis = this.thesis.evaluate({
      objective: 'Manter continuidade perceptiva enquanto o backend troca representação de espaço até objeto',
      constraints: ['não carregar o planeta inteiro', 'D-O15 de representação'],
      resources: ['ladder', 'ECEF token', 'dormant reconstruct'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-scale-v1',
      rungs: [...rungs],
      descent: { path: descent.path, jump: descent.perceivedJump, sameWorld: descent.sameWorld },
      hop: { path: hop.path, layers: hop.layers.map(item => ({ rung: item.rung, fidelity: item.fidelity, resident: item.resident })) },
      stack: stack('city').map(item => ({ rung: item.rung, fidelity: item.fidelity, representation: item.representation })),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: descent.path.length === 7
          && descent.sameWorld
          && !descent.perceivedJump
          && hop.layers.some(item => item.fidelity === 'full' && item.rung === 'city')
          && hop.layers.some(item => item.fidelity === 'dormant')
          && pathBetween('street', 'continent').length === 4,
        loadedWholePlanet: false,
      },
      limitations: ['Representation ladder + continuity token', 'Not a seamless streamed Earth globe'],
    }
  }
}
