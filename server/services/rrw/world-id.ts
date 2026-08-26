import { createHash } from 'node:crypto'

export const worldIdOf = (prompt: string, salt = 'rrw') =>
  createHash('sha256').update(`rrw-world-v1:${salt}:${prompt.trim().toLowerCase()}`).digest('hex').slice(0, 16)
