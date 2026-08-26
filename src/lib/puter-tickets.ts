import { puterGateway } from './puter'

export interface ClientTicket {
  role: string
  provider: string
  modelId: string
}

export const runPuterTickets = async (tickets: ClientTicket[], prompt: string) => {
  const results: { role: string; executed: boolean; reason: string; modelId: string }[] = []
  for (const ticket of tickets) {
    try {
      const puter = await puterGateway.load()
      if (!puter.auth.isSignedIn()) {
        results.push({ role: ticket.role, executed: false, reason: 'not-signed-in', modelId: ticket.modelId })
        continue
      }
      await puterGateway.chat(ticket.provider, ticket.modelId, prompt, { stream: false })
      results.push({ role: ticket.role, executed: true, reason: 'puter-chat', modelId: ticket.modelId })
    } catch (error) {
      results.push({
        role: ticket.role,
        executed: false,
        reason: error instanceof Error ? error.message : 'puter-unavailable',
        modelId: ticket.modelId,
      })
    }
  }
  return {
    results,
    automaticPuter: results.some(item => item.executed),
    inventedIds: false as const,
  }
}
