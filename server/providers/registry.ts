import type { Capability, ModelDescriptor } from '../domain.js'
import type { AIProvider } from './provider.js'
import { AppError } from '../lib/errors.js'

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>()
  register(provider: AIProvider) { this.providers.set(provider.id, provider); return this }
  listModels() { return [...this.providers.values()].flatMap(provider => provider.models()) }
  provider(id: string) { return this.providers.get(id) }

  candidates(capabilities: Capability[]): { provider: AIProvider; model: ModelDescriptor }[] {
    const rank = { 'S++': 4, 'S+': 3, S: 2, A: 1, UNRANKED: 0 }
    const exact = this.listModels().filter(model => model.available && capabilities.every(capability => model.capabilities.includes(capability)))
      .sort((a, b) => rank[b.tier] - rank[a.tier])
    const models = exact.length ? exact : this.listModels().filter(item => item.available).sort((a, b) => rank[b.tier] - rank[a.tier])
    return models.flatMap(model => {
      const provider = this.providers.get(model.provider)
      return provider ? [{ provider, model }] : []
    })
  }

  select(capabilities: Capability[]) {
    const candidate = this.candidates(capabilities)[0]
    if (!candidate) throw new AppError('Nenhum modelo disponível.', 503, 'NO_MODEL_AVAILABLE')
    return candidate
  }
}
