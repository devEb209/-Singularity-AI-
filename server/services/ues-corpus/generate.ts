import { UesAdvancedPipeline } from '../ues-advanced-pipeline.js'
import type { CorpusEntry } from './types.js'

const advanced = new UesAdvancedPipeline({} as never, {} as never)

export const toSemantic = (entry: CorpusEntry) => ({
  format: 'ues-semantic-object-v1' as const,
  identity: { kind: entry.kind, prompt: entry.prompt },
  parts: entry.parts,
  relations: entry.parts.filter(part => part.parent).map(part => ({ type: 'attached-to' as const, from: part.name, to: part.parent })),
  verification: {
    uniqueParts: new Set(entry.parts.map(part => part.name)).size === entry.parts.length,
    allParentsExist: entry.parts.every(part => !part.parent || entry.parts.some(candidate => candidate.name === part.parent)),
  },
})

export const meshEntry = (entry: CorpusEntry, segments = 5) => {
  const semantic = toSemantic(entry)
  const mesh = advanced.parametricMesh(semantic, segments)
  return { entry, semantic, mesh }
}
