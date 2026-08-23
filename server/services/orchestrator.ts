import type { ChatRequest, ChatResult } from '../domain.js'
import { AppError } from '../lib/errors.js'
import type { Store } from '../repositories/store.js'
import type { ProviderRegistry } from '../providers/registry.js'
import { requiredCapabilities } from '../providers/provider.js'
import type { ContextEngine } from './context-engine.js'

export class Orchestrator {
  constructor(private store: Store, private registry: ProviderRegistry, private context: ContextEngine) {}

  async chat(request: ChatRequest): Promise<ChatResult> {
    const started = performance.now()
    const capabilities = requiredCapabilities(request.message)
    const candidates = this.registry.candidates(capabilities)
    if (!candidates.length) throw new AppError('Nenhum modelo disponível.', 503, 'NO_MODEL_AVAILABLE')
    const conversation = request.conversationId
      ? this.store.getConversation(request.conversationId, request.userId)
      : this.store.createConversation(request.userId, this.title(request.message), request.projectId)
    this.store.addMessage(conversation.id, request.userId, 'user', request.message)
    const memories = this.context.retrieve(request.userId, request.message, request.projectId)
    const history = this.store.listMessages(conversation.id, request.userId).slice(-12)
    const system = this.systemPrompt(request.mode, memories.map(item => item.content))
    const failures: { provider: string; model: string; reason: string }[] = []

    for (const { provider, model } of candidates) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), request.mode === 'deep' ? 120000 : 60000)
      try {
        const output = await provider.generate({ model: model.id, messages: [{ role: 'system', content: system }, ...history.map(item => ({ role: item.role, content: item.content }))], temperature: request.mode === 'fast' ? 0.2 : 0.4, signal: controller.signal })
        const plan = this.plan(capabilities, failures.length)
        const confidence=model.tier === 'S++' ? .98 : model.tier === 'S+' ? .95 : model.tier === 'S' ? .92 : model.tier === 'A' ? .82 : .5
        const trust={confidence,evidence:{contextItems:memories.length,sourceCount:0},verification:{status:'not-verified' as const,deterministic:false}}
        const message = this.store.addMessage(conversation.id, request.userId, 'assistant', output.content, { model: model.id, provider: provider.id, capabilities, usage: output.usage, verificationStatus:trust.verification.status, fallbackCount: failures.length })
        return { conversationId: conversation.id, message, plan, model, confidence,trust, contextItems: memories.length, durationMs: Math.round(performance.now() - started) }
      } catch (error) {
        failures.push({ provider: provider.id, model: model.id, reason: error instanceof Error ? error.message : 'Falha desconhecida' })
      } finally { clearTimeout(timeout) }
    }
    throw new AppError('Todos os modelos compatíveis falharam.', 503, 'ALL_PROVIDERS_FAILED', failures)
  }

  private title(message: string) { return message.trim().replace(/\s+/g, ' ').slice(0, 56) || 'Nova conversa' }
  private plan(capabilities: string[], fallbackCount: number) { return ['Interpretar intenção', ...(capabilities.includes('research') ? ['Coletar e comparar evidências'] : []), ...(capabilities.includes('code') ? ['Planejar e validar implementação'] : []), 'Selecionar especialista', ...(fallbackCount ? [`Executar fallback (${fallbackCount})`] : []), 'Gerar resposta', 'Verificar resultado'] }
  private systemPrompt(mode: string, memories: string[]) {
    return `Você é a Singularity AI, plataforma da Bunker Studios. Seja preciso, útil e honesto. Não alegue consciência. Modo: ${mode}. ${memories.length ? `Contexto relevante:\n- ${memories.join('\n- ')}` : 'Nenhuma memória relevante foi recuperada.'}`
  }
}
