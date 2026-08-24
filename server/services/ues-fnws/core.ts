import { DThesisCore } from '../d-thesis/core.js'
import { hashSeed } from '../ues-shared/math.js'
import { heightField } from '../ues-planet/height.js'
import { flow, initWater, tickWater, volume } from './cycle.js'
import { layersFromFixture, layersFromSeed, rainAmount, type HydroLayers } from './ingest.js'
import { sphAdapter } from './sph.js'
import { oceanWaves, pressure } from './waves.js'

export class UesFnwsCore {
  private thesis = new DThesisCore()

  process(seedText = 'earth-like', source: 'internal-geophysics' | 'licensed-fixture' = 'internal-geophysics') {
    const layers: HydroLayers = source === 'licensed-fixture' ? layersFromFixture() : layersFromSeed(seedText)
    const heights = layers.heights.length === 36 ? layers.heights : heightField(hashSeed(seedText), 36)
    const initial = initWater(heights)
    const conserved = flow(heights, flow(heights, initial.map(row => row.slice())))
    const before = volume(initial)
    const afterFlow = volume(conserved)
    let state = { depth: initial.map(row => row.slice()), evaporated: 0, rained: 0 }
    const rain = Math.max(0.01, rainAmount(layers))
    for (let i = 0; i < 6; i++) state = tickWater(heights, state, rain, 0.01)
    const highland = (() => {
      let best = [0, 0] as [number, number]
      let h = -Infinity
      for (let z = 0; z < heights.length; z++) {
        for (let x = 0; x < heights.length; x++) {
          if (heights[z][x] > h) {
            h = heights[z][x]
            best = [x, z]
          }
        }
      }
      return best
    })()
    const isolated = heights.map(row => row.map(() => 0))
    isolated[highland[1]][highland[0]] = 1
    let moved = isolated
    for (let i = 0; i < 10; i++) moved = flow(heights, moved)
    const stayed = moved[highland[1]][highland[0]]
    const waves = oceanWaves(heights, 1.2)
    const dThesis = this.thesis.evaluate({
      objective: 'Simular água natural sobre terreno: fluxo, volume, pressão, chuva e ondas',
      constraints: ['CPU only', 'não reivindicar SPH GPU'],
      resources: ['heightfield', 'Stable Fluids already exists for smoke'],
      priorities: { quality: 8, performance: 8, safety: 7, cost: 5, scalability: 8 },
    })
    return {
      format: 'ues-fnws-v1',
      conservation: { before, afterFlow, error: Math.abs(before - afterFlow) },
      cycle: { rained: state.rained, evaporated: state.evaporated, remaining: volume(state.depth) },
      downhill: { stayed, moved: 1 - stayed },
      waves: waves.length,
      samplePressure: pressure(0.4),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: Math.abs(before - afterFlow) < 1e-6 && stayed < 0.85 && waves.length > 0 && state.rained > 0 && state.evaporated > 0,
        sph: false,
        gpu: false,
      },
      limitations: ['Heightfield water + Gerstner samples', 'Not GPU SPH oceans'],
    }
  }
}
