import type { Memory } from '../domain.js'
import type { Store } from '../repositories/store.js'

const tokens = (text: string) => new Set(text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\W+/).filter(word => word.length > 2))

export class ContextEngine {
  constructor(private store: Store) {}
  retrieve(userId: string, query: string, projectId?: string, limit = 6): Memory[] {
    const queryTokens = tokens(query)
    return this.store.listMemories(userId, projectId)
      .map(memory => {
        const words = tokens(memory.content)
        const overlap = [...queryTokens].filter(word => words.has(word)).length
        return { memory, score: overlap * 2 + memory.importance / 10 }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory)
  }
}
