import { describe, expect, it } from 'vitest'
import { Authority } from './authority.js'
import { UesNetCore } from './core.js'
import { deliver, schedule } from './network.js'
import { reconcile } from './reconcile.js'

describe('UES net simulation', () => {
  it('rejects speed-hacks, duplicates and spoofed owners', () => {
    const server = new Authority()
    server.spawn('p1')
    server.apply({ seq: 1, playerId: 'p1', ax: 1, ay: 0 })
    expect(server.apply({ seq: 2, playerId: 'p1', ax: 80, ay: 0 }).reason).toBe('speed-hack')
    expect(server.apply({ seq: 1, playerId: 'p1', ax: 1, ay: 0 }).reason).toBe('duplicate')
    expect(server.apply({ seq: 3, playerId: 'x', ax: 1, ay: 0 }).reason).toBe('spoof')
  })

  it('schedules loss and reconciles prediction error', () => {
    const packets = schedule([{ seq: 1, playerId: 'p1', ax: 1, ay: 0 }], { latencyMs: 10, jitterMs: 0, loss: 1, duplicate: 0 }, 0, 'loss')
    expect(packets[0].dropped).toBe(true)
    expect(deliver(packets, 1000)).toHaveLength(0)
    const correction = reconcile(
      { id: 'e', playerId: 'p1', x: 0, y: 0, vx: 0, vy: 0 },
      { id: 'e', playerId: 'p1', x: 2, y: 0, vx: 0, vy: 0 },
      [],
    )
    expect(correction.error).toBeGreaterThan(0)
    expect(new UesNetCore().simulate().verification.valid).toBe(true)
  })
})
