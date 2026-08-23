import type { AIProvider, GenerateInput } from './provider.js'
import type { ModelDescriptor } from '../domain.js'

export class MockProvider implements AIProvider {
  readonly id = 'singularity-local'
  models(): ModelDescriptor[] {
    return [{ id: 'internal-mock-response', provider: this.id, label: 'Internal Mock (not Puter)', capabilities: ['chat', 'reasoning', 'code', 'research', 'vision', 'creative', 'planning'], tier: 'UNRANKED', available: true, latencyMs: 20 }]
  }
  async health() { return true }
  async generate(input: GenerateInput) {
    const prompt = input.messages.at(-1)?.content ?? ''
    return {
      content: `Missão compreendida: “${prompt}”. O backend modular da Singularity está operacional. Configure um provedor real no ambiente para substituir esta resposta de demonstração, preservando orquestração, memória, fallback e verificação.`,
      usage: { input: input.messages.reduce((sum, message) => sum + message.content.length, 0), output: 180 },
    }
  }
}
