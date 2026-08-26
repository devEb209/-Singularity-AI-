import { chronicleOf, statementsOf } from './chronicle.js'
import type { RealityNode } from './types.js'

export const askChronicle = (nodes: RealityNode[], question: string) => {
  const hay = question.toLowerCase()
  const statements = statementsOf(nodes)
  const match = (keys: string[]) => statements.filter(item => keys.some(key => item.toLowerCase().includes(key)))
  if (hay.includes('fogo') || hay.includes('fire') || hay.includes('esfri')) return { kind: 'fire' as const, found: match(['fire', 'fogo', 'cool']).length > 0, hits: match(['fire', 'fogo', 'cool']) }
  if (hay.includes('forrage') || hay.includes('comida') || hay.includes('forage')) return { kind: 'forage' as const, found: match(['forage']).length > 0, hits: match(['forage']) }
  if (hay.includes('água') || hay.includes('agua') || hay.includes('water')) return { kind: 'water' as const, found: match(['water', 'água']).length > 0, hits: match(['water', 'água']) }
  if (hay.includes('abrigo') || hay.includes('shelter')) return { kind: 'shelter' as const, found: match(['shelter', 'abrigo', 'seek-shelter']).length > 0, hits: match(['shelter', 'abrigo', 'seek-shelter']) }
  return { kind: 'all' as const, found: statements.length > 0, hits: statements }
}

export const chronicleSize = (nodes: RealityNode[]) => chronicleOf(nodes).claims.length
