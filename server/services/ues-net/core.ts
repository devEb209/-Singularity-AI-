import { DThesisCore } from '../d-thesis/core.js'
import { Authority } from './authority.js'
import { deliver, schedule } from './network.js'
import { predict, reconcile } from './reconcile.js'
import type { PlayerInput } from './types.js'

export class UesNetCore {
  private thesis = new DThesisCore()

  simulate() {
    const guard = new Authority()
    guard.spawn('p1', 0, 0)
    guard.apply({ seq: 1, playerId: 'p1', ax: 1, ay: 0 })
    const rejects = [
      guard.apply({ seq: 2, playerId: 'p1', ax: 80, ay: 0 }),
      guard.apply({ seq: 1, playerId: 'p1', ax: 1, ay: 0 }),
      guard.apply({ seq: 3, playerId: 'intruder', ax: 1, ay: 0 }),
    ]
    const server = new Authority()
    server.spawn('p1', 0, 0)
    const honest: PlayerInput[] = Array.from({ length: 8 }, (_, i) => ({ seq: i + 1, playerId: 'p1', ax: 2, ay: 0 }))
    const packets = schedule(honest, { latencyMs: 40, jitterMs: 12, loss: 0.15, duplicate: 0.1 }, 0, 'match-1')
    const arrived = deliver(packets, 200)
    const accepted = arrived.map(packet => server.apply(packet.input)).filter(item => item.accepted).length
    const snap = server.snapshot()
    const local = predict({ id: 'ent-p1', playerId: 'p1', x: 0, y: 0, vx: 0, vy: 0 }, honest)
    const correction = reconcile(snap.entities[0], local, honest.filter(item => item.seq > (server.lastSeq.get('p1') ?? 0)))
    const dThesis = this.thesis.evaluate({
      objective: 'Simular autoridade, predição, reconciliação e rede adversária',
      constraints: ['sem WebRTC', 'rejeitar speed-hack e spoof'],
      resources: ['CPU'],
      priorities: { quality: 7, performance: 8, safety: 9, cost: 5, scalability: 8 },
    })
    return {
      format: 'ues-net-v1',
      transport: 'simulated-not-webrtc',
      snapshot: snap,
      rejects: rejects.map(item => item.reason),
      accepted,
      dropped: packets.filter(item => item.dropped).length,
      correction,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: rejects.every(item => !item.accepted) && snap.entities.length === 1,
        rejectedSpeedHack: rejects[0].reason === 'speed-hack',
        rejectedDuplicate: rejects[1].reason === 'duplicate',
        rejectedSpoof: rejects[2].reason === 'spoof',
      },
    }
  }
}
