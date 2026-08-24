import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { capsulePlaneCcd, rotatingBoxAabbCcd, spherePlaneCcd, sphereSphereCcd } from './ccd.js'
import { crba, defaultArm, defaultPendulum, forwardDynamics, massSpd, pendulumClosedForm } from './featherstone.js'

export class UesDynamicsCore {
  private thesis = new DThesisCore()

  process() {
    const falling = sphereSphereCcd([0, 2, 0], 0.5, [0, -10, 0], [0, 0, 0], 0.5, [0, 0, 0], 1)
    const miss = sphereSphereCcd([0, 2, 0], 0.5, [8, 0, 0], [0, 0, 0], 0.5, [0, 0, 0], 0.2)
    const floor = spherePlaneCcd([0, 1.2, 0], 0.2, [0, -4, 0], [0, 1, 0], 0, 1)
    const capsule = capsulePlaneCcd([0, 1.4, 0], [0, 0.9, 0], 0.15, [0, -3, 0], [0, 1, 0], 0, 1)
    const yaw = rotatingBoxAabbCcd([0, 0.4, 0], [0.35, 0.12, 0.12], 0, 4, [0.25, 0, -0.2], [0.7, 0.8, 0.2], 1)
    const rod = defaultPendulum()
    const analytic = pendulumClosedForm(rod[0], 0)
    const numeric = forwardDynamics(rod, { q: [0], qd: [0] }, [0])[0]
    const arm = defaultArm()
    const mass = crba(arm, [0.2, 0.4, -0.1])
    const qdd = forwardDynamics(arm, { q: [0.2, 0.4, -0.1], qd: [0, 0, 0] }, [0, 0, 0])
    const kernel = runKernel('CCD analítico e Featherstone CRBA/RNEA internos', 'ues.dynamics', ['gjk', 'ccd', 'aba'], [
      { module: 'knowledge', accepted: true, note: 'closed-form contact + serial chain' },
      { module: 'd-thesis', accepted: true, note: 'CPU compete physics' },
      { module: 'dynamics', accepted: falling.hit && floor.hit, note: falling.method },
      { module: 'represent', accepted: true, note: 'serial chain only when needed' },
      { module: 'd-o15', accepted: true, note: 'planar CRBA n<=3' },
      { module: 'execute', accepted: Number.isFinite(numeric) && qdd.every(Number.isFinite), note: 'forward dynamics' },
      { module: 'verify', accepted: Math.abs(numeric - analytic) < 1e-6 && massSpd(mass), note: 'pendulum closed form' },
      { module: 'refine', accepted: !miss.hit, note: 'negative CCD' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Física determinística que compete: contato analítico + Featherstone serial',
      constraints: ['não reivindicar PhysX', 'não fingir ABA espacial ramificado'],
      resources: ['quadratic CCD', 'CRBA', 'RNEA'],
      priorities: { quality: 9, performance: 7, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-dynamics-v1',
      ccd: { falling, miss, floor, capsule, yaw },
      featherstone: {
        algorithm: 'crba-rnea-planar-serial',
        pendulum: { analytic, numeric, error: Math.abs(numeric - analytic) },
        massSpd: massSpd(mass),
        armQdd: qdd.map(value => Number(value.toFixed(6))),
        spatialBranchedAba: false,
      },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid
          && falling.hit && Math.abs(falling.toi - 0.1) < 1e-4
          && !miss.hit
          && floor.hit
          && capsule.hit
          && Math.abs(numeric - analytic) < 1e-6
          && massSpd(mass)
          && qdd.every(Number.isFinite),
        analyticRotation: yaw.method === 'analytic-yaw-vertex-aabb',
        completeObbObb: false,
        physx: false,
      },
      limitations: ['Planar serial Featherstone CRBA/RNEA', 'Yaw vertex-arc CCD, not complete OBB-OBB'],
    }
  }
}
