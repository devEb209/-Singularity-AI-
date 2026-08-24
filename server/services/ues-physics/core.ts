import { DThesisCore } from '../d-thesis/core.js'
import { islands, sweptAabb, type Aabb } from './ccd.js'
import { boxHull, sphere } from './convex.js'
import { contact } from './epa.js'
import { gjk } from './gjk.js'
import { rotationalAdvance } from './rotate.js'
import { sleepIslands, wakeByImpulse } from './sleep.js'
import type { RigidBody } from './types.js'

export class UesPhysicsCore {
  private thesis = new DThesisCore()

  process() {
    const aabbs: Aabb[] = [
      { id: 'fast', position: [0, 2, 0], velocity: [0, -20, 0], half: [0.4, 0.4, 0.4] },
      { id: 'ground', position: [0, 0, 0], velocity: [0, 0, 0], half: [4, 0.25, 4] },
    ]
    const ccd = sweptAabb(aabbs[0], aabbs[1], 1 / 30)
    const overlapping = contact(sphere('sa', [0, 0, 0], 1), sphere('sb', [1.5, 0, 0], 1))
    const separated = gjk(sphere('sc', [0, 0, 0], 1), sphere('sd', [4, 0, 0], 1))
    const boxes = contact(boxHull('ba', [0, 0, 0], [0.5, 0.5, 0.5]), boxHull('bb', [0.8, 0, 0], [0.5, 0.5, 0.5]))
    const sweep = rotationalAdvance([0, 0, 0], [0.4, 0.4, 0.8], 0, Math.PI / 2, boxHull('wall', [1, 0, 0], [0.3, 0.3, 0.3]))
    const bodies: RigidBody[] = [
      { id: 'rest-a', velocity: [0.01, 0, 0], sleeping: false, still: 0 },
      { id: 'rest-b', velocity: [0, 0.01, 0], sleeping: false, still: 0 },
      { id: 'awake', velocity: [2, 0, 0], sleeping: false, still: 0 },
    ]
    for (let tick = 0; tick < 5; tick++) sleepIslands(bodies, [['rest-a', 'rest-b'], ['awake']])
    wakeByImpulse(bodies, ['rest-a'])
    const dThesis = this.thesis.evaluate({
      objective: 'Detectar contato convexo, ilhas adormecidas e varredura rotacional conservadora',
      constraints: ['CPU only', 'não reivindicar PhysX', 'rotação amostrada'],
      resources: ['GJK', 'EPA', 'CCD AABB'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-physics-convex-v1',
      ccd: { hit: ccd, islands: islands(ccd ? [ccd] : []) },
      spheres: {
        overlapping: { hit: overlapping.hit, depth: overlapping.epa?.depth, normal: overlapping.epa?.normal },
        separated: { hit: separated.hit },
      },
      boxes: { hit: boxes.hit, depth: boxes.epa?.depth },
      rotation: sweep,
      sleep: bodies.map(body => ({ id: body.id, sleeping: body.sleeping, still: body.still })),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: overlapping.hit && !separated.hit && Boolean(overlapping.epa) && (overlapping.epa?.depth ?? 0) > 0.3 && (overlapping.epa?.depth ?? 0) < 0.7 && bodies.some(body => body.id === 'rest-b' && body.sleeping) && !bodies.find(body => body.id === 'awake')?.sleeping && sweep.hit && sweep.toi > 0 && sweep.toi < 1,
        gjk: true,
        epa: Boolean(overlapping.epa),
        sleepingIslands: true,
        analyticRotation: false,
      },
      limitations: ['GJK/EPA CPU reference', 'Rotational CCD is conservative sampled, not analytic', 'Not a production constraint solver'],
    }
  }
}
