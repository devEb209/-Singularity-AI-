import { rng } from '../ues-shared/math.js'
import type { NetConfig, PlayerInput } from './types.js'

export interface Packet {
  deliverAt: number
  input: PlayerInput
  dropped: boolean
}

export const schedule = (inputs: PlayerInput[], config: NetConfig, now = 0, seed = 'net') => {
  const random = rng(seed.length * 17 + 3)
  const packets: Packet[] = []
  for (const input of inputs) {
    if (random() < config.loss) {
      packets.push({ deliverAt: Infinity, input, dropped: true })
      continue
    }
    const delay = config.latencyMs + (random() * 2 - 1) * config.jitterMs
    packets.push({ deliverAt: now + Math.max(0, delay), input, dropped: false })
    if (random() < config.duplicate) {
      packets.push({ deliverAt: now + Math.max(0, delay) + 4, input, dropped: false })
    }
  }
  return packets.sort((a, b) => a.deliverAt - b.deliverAt)
}

export const deliver = (packets: Packet[], at: number) => packets.filter(packet => !packet.dropped && packet.deliverAt <= at)
