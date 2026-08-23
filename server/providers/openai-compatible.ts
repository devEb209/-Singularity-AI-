import { AppError } from '../lib/errors.js'
import type { ModelDescriptor } from '../domain.js'
import type { AIProvider, GenerateInput } from './provider.js'

export class OpenAICompatibleProvider implements AIProvider {
  readonly id = 'openai-compatible'
  constructor(private baseUrl: string, private apiKey: string, private model: string) {}
  models(): ModelDescriptor[] {
    return [{ id: this.model, provider: this.id, label: this.model, capabilities: ['chat', 'reasoning', 'code', 'planning'], tier: 'S', available: true }]
  }
  async health() {
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/models`, { headers: { Authorization: `Bearer ${this.apiKey}` }, signal: AbortSignal.timeout(5000) })
      return response.ok
    } catch { return false }
  }
  async generate(input: GenerateInput) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: input.model, messages: input.messages, temperature: input.temperature ?? 0.4 }),
      signal: input.signal ?? AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new AppError(`Provedor retornou HTTP ${response.status}.`, 502, 'PROVIDER_ERROR')
    const data = await response.json() as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens: number; completion_tokens: number } }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new AppError('Resposta vazia do provedor.', 502, 'EMPTY_PROVIDER_RESPONSE')
    return { content, usage: data.usage ? { input: data.usage.prompt_tokens, output: data.usage.completion_tokens } : undefined }
  }
}
