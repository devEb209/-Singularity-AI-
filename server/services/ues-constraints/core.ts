import { DThesisCore } from '../d-thesis/core.js'
import { distanceOf } from './distance.js'
import { angleAt } from './hinge.js'
import { cloneParticles, solve, verlet } from './solver.js'
import { energy } from './spring.js'
import type { Particle } from './types.js'

const particle = (id: string, x: number, y: number, invMass = 1): Particle => ({
  id,
  position: [x, y, 0],
  prev: [x, y, 0],
  invMass,
})

export class UesConstraintsCore {
  private thesis = new DThesisCore()

  process() {
    const distanceBodies = [particle('a', 0, 0), particle('b', 2, 0)]
    const beforeDistance = distanceOf(distanceBodies, 'a', 'b')
    solve(distanceBodies, [{ kind: 'distance', a: 'a', b: 'b', rest: 1 }], [], [], 10)
    const afterDistance = distanceOf(distanceBodies, 'a', 'b')

    const hingeBodies = [particle('a', 1, 0), particle('b', 0, 0, 0), particle('c', 0.2, 0.05)]
    const beforeAngle = angleAt(hingeBodies[0], hingeBodies[1], hingeBodies[2])
    solve(hingeBodies, [], [{ kind: 'hinge', a: 'a', b: 'b', c: 'c', rest: Math.PI / 2 }], [], 14)
    const afterAngle = angleAt(hingeBodies[0], hingeBodies[1], hingeBodies[2])

    const springBodies = [particle('anchor', 0, 0, 0), particle('mass', 2.2, 0)]
    const spring = { a: 'anchor', b: 'mass', rest: 1, stiffness: 6, damping: 8 }
    const samples: number[] = []
    for (let step = 0; step < 36; step++) {
      verlet(springBodies, 1 / 30)
      solve(springBodies, [], [], [spring], 4, 1 / 30)
      samples.push(energy(springBodies, [spring], 1 / 30).total)
    }

    const dThesis = this.thesis.evaluate({
      objective: 'Resolver restrições de distância, dobradiça e mola no CPU',
      constraints: ['não reivindicar Featherstone', 'partículas'],
      resources: ['CPU'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-constraints-v1',
      distance: { before: beforeDistance, after: afterDistance },
      hinge: { before: beforeAngle, after: afterAngle, rest: Math.PI / 2 },
      spring: { first: samples[1], last: samples[samples.length - 1] },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: afterDistance < beforeDistance && afterDistance < 1.15 && Math.abs(afterAngle - Math.PI / 2) < Math.abs(beforeAngle - Math.PI / 2) && samples[samples.length - 1] < samples[1],
        featherstone: false,
      },
      limitations: ['Particle Gauss-Seidel', 'Not a full articulated-body solver'],
      snapshot: cloneParticles(distanceBodies).map(item => item.id),
    }
  }
}
