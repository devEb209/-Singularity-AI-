import { describe, expect, it } from 'vitest'
import { capsulePlaneCcd, spherePlaneCcd, sphereSphereCcd } from './ccd.js'
import { UesDynamicsCore } from './core.js'
import { crba, defaultPendulum, forwardDynamics, massSpd, pendulumClosedForm } from './featherstone.js'

describe('UES analytic CCD and Featherstone CRBA', () => {
  it('matches the horizontal pendulum closed form and quadratic sphere CCD', () => {
    const hit = sphereSphereCcd([0, 2, 0], 0.5, [0, -10, 0], [0, 0, 0], 0.5, [0, 0, 0], 1)
    expect(hit.hit).toBe(true)
    expect(hit.toi).toBeCloseTo(0.1, 5)
    expect(sphereSphereCcd([8, 0, 0], 0.4, [0, 0, 0], [0, 0, 0], 0.4, [0, 0, 0], 0.2).hit).toBe(false)
    expect(spherePlaneCcd([0, 1, 0], 0.2, [0, -2, 0], [0, 1, 0], 0, 1).toi).toBeCloseTo(0.4, 5)
    expect(capsulePlaneCcd([0, 1.2, 0], [0, 0.8, 0], 0.1, [0, -2, 0], [0, 1, 0], 0, 1).hit).toBe(true)
    const rod = defaultPendulum()
    const numeric = forwardDynamics(rod, { q: [0], qd: [0] }, [0])[0]
    expect(numeric).toBeCloseTo(pendulumClosedForm(rod[0], 0), 8)
    expect(numeric).toBeCloseTo(-3 * 9.81 / (2 * 0.8), 8)
    expect(massSpd(crba(rod, [0.3]))).toBe(true)
    const result = new UesDynamicsCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.physx).toBe(false)
    expect(result.featherstone.spatialBranchedAba).toBe(false)
  })
})
