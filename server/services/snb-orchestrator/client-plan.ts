import { critiqueInternal } from './internal-critic.js'
import { canonicalTickets } from './tickets.js'

export const clientPuterPlan = (intent: string) => {
  const tickets = canonicalTickets()
  const critic = critiqueInternal(intent)
  return {
    tickets,
    automaticWhenPuterPresent: true as const,
    serverExecutesPuter: false as const,
    fallback: 'internal-critic' as const,
    critic,
    inventedIds: false as const,
  }
}
