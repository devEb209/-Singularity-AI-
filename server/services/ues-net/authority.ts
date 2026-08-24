import type { Entity, PlayerInput, RejectReason } from './types.js'

const MAX_ACCEL = 12
const DT = 1 / 20

export class Authority {
  entities = new Map<string, Entity>()
  lastSeq = new Map<string, number>()
  tick = 0

  spawn(playerId: string, x = 0, y = 0) {
    const entity: Entity = { id: `ent-${playerId}`, playerId, x, y, vx: 0, vy: 0 }
    this.entities.set(entity.id, entity)
    this.lastSeq.set(playerId, 0)
    return entity
  }

  apply(input: PlayerInput): { accepted: boolean; reason?: RejectReason } {
    if (Math.hypot(input.ax, input.ay) > MAX_ACCEL) return { accepted: false, reason: 'speed-hack' }
    const last = this.lastSeq.get(input.playerId) ?? 0
    if (input.seq <= last) return { accepted: false, reason: 'duplicate' }
    const entity = [...this.entities.values()].find(item => item.playerId === input.playerId)
    if (!entity) return { accepted: false, reason: 'spoof' }
    if (!Number.isFinite(input.ax) || !Number.isFinite(input.ay)) return { accepted: false, reason: 'unbounded' }
    entity.vx = input.ax
    entity.vy = input.ay
    entity.x += entity.vx * DT
    entity.y += entity.vy * DT
    this.lastSeq.set(input.playerId, input.seq)
    return { accepted: true }
  }

  snapshot() {
    this.tick += 1
    return {
      tick: this.tick,
      entities: [...this.entities.values()].map(item => ({ ...item })),
    }
  }
}
