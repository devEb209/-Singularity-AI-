import type { Capability, ModelDescriptor, Role } from '../domain.js'

export interface ProviderMessage { role: Role; content: string }
export interface GenerateInput {
  messages: ProviderMessage[]
  model: string
  temperature?: number
  signal?: AbortSignal
}
export interface GenerateOutput { content: string; usage?: { input: number; output: number } }

export interface AIProvider {
  readonly id: string
  models(): ModelDescriptor[]
  health(): Promise<boolean>
  generate(input: GenerateInput): Promise<GenerateOutput>
}

export function requiredCapabilities(message: string): Capability[] {
  const normalized = message.toLowerCase()
  const result: Capability[] = ['chat']
  if (/código|code|program|typescript|python|bug|api/.test(normalized)) result.push('code')
  if (/pesquis|fonte|atual|notícia|compare/.test(normalized)) result.push('research')
  if (/imagem|foto|visual|design|vídeo|3d/.test(normalized)) result.push('vision', 'creative')
  if (/planej|estratég|arquitet|projeto|constru/.test(normalized)) result.push('planning', 'reasoning')
  return [...new Set(result)]
}
