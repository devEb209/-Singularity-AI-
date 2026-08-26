import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parsePuterRegistry } from '../../../scripts/parse-puter-registry.js'

export interface PuterTicket {
  role: 'critic' | 'research'
  provider: string
  modelId: string
  puterId?: string
  status: 'pending-client'
}

let cached: PuterTicket[] | undefined

export const canonicalTickets = (): PuterTicket[] => {
  if (cached) return cached
  const path = resolve('./puter-models.txt')
  if (!existsSync(path)) {
    cached = []
    return cached
  }
  const models = parsePuterRegistry(readFileSync(path, 'utf8')).models
  const first = models.find(item => item.provider === 'claude') ?? models[0]
  const second = models.find(item => item.provider !== first.provider) ?? models[1]
  cached = [
    { role: 'critic', provider: first.provider, modelId: first.id, puterId: first.puterId, status: 'pending-client' },
    { role: 'research', provider: second.provider, modelId: second.id, puterId: second.puterId, status: 'pending-client' },
  ]
  return cached
}
