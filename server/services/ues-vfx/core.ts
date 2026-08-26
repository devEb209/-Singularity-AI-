import { DThesisCore } from '../d-thesis/core.js'
import { makeGrid, metrics, project } from './fluid.js'
import { gate } from './gates.js'
import { simulateSmoke } from './smoke.js'

export class UesVfxCore {
  private thesis = new DThesisCore()

  process() {
    const random = makeGrid(16)
    for (let i = 0; i < random.u.length; i++) {
      random.u[i] = Math.sin(i * 0.17)
      random.v[i] = Math.cos(i * 0.13)
    }
    const before = metrics(random)
    project(random.n, random.u, random.v)
    const after = metrics(random)
    let smoke = simulateSmoke(14, 16)
    const timed = gate('smoke-14', 80, () => {
      smoke = simulateSmoke(14, 16)
    })
    const dThesis = this.thesis.evaluate({
      objective: 'Simular fumaça e fluidos 2D no CPU com portão de orçamento',
      constraints: ['sem shader', 'sem SPH GPU', 'D-O15 de custo'],
      resources: ['CPU', 'grade 16'],
      priorities: { quality: 6, performance: 9, safety: 7, cost: 6, scalability: 7 },
    })
    return {
      format: 'ues-vfx-v1',
      projection: { before: before.meanAbsDiv, after: after.meanAbsDiv, reduced: after.meanAbsDiv < before.meanAbsDiv },
      smoke,
      gate: timed,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: after.meanAbsDiv < before.meanAbsDiv && smoke.rose && smoke.massStable && !timed.overBudget,
        gpu: false,
        shader: false,
      },
      limitations: ['Stable Fluids 2D CPU', 'Not renderer shaders', 'Not GPU SPH'],
    }
  }
}
