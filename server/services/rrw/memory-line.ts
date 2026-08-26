import { openSession, tickSession } from './session.js'

export const recordSessionLine = (prompt = 'oceano salgado com fogo', ticks = 2) => {
  let session = openSession(prompt)
  for (let i = 0; i < ticks; i++) session = tickSession(session, 2)
  const unique = new Set(session.lineage).size
  return {
    versions: session.lineage.length,
    unique,
    evolved: unique >= 2,
    lineagePreserved: session.lineage.length === ticks + 1,
    eraseHistory: false as const,
    meshStore: false as const,
    checksum: session.checksum,
  }
}
