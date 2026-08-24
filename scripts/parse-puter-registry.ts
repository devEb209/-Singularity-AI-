import type { PuterModelInput } from '../server/services/model-catalog.js'

type RegistryModel = PuterModelInput & { puterId?: string; modalities?: unknown; open_weights?: boolean; tool_call?: boolean; knowledge?: string; release_date?: string; costs_currency?: string; input_cost_key?: string; output_cost_key?: string }

const line = (block: string, label: string) => block.match(new RegExp(`^${label}:\\s*(.+)$`, 'm'))?.[1]?.trim()
const jsonField = (block: string, label: string) => {
  const marker = `${label}: `; const start = block.indexOf(marker)
  if (start < 0) return undefined
  const valueStart = start + marker.length; const opener = block[valueStart]
  if (opener !== '{' && opener !== '[') return undefined
  const closer = opener === '{' ? '}' : ']'; let depth = 0; let quoted = false; let escaped = false
  for (let index = valueStart; index < block.length; index++) {
    const char = block[index]
    if (quoted) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') quoted = false; continue }
    if (char === '"') quoted = true
    else if (char === opener) depth++
    else if (char === closer && --depth === 0) return JSON.parse(block.slice(valueStart, index + 1)) as unknown
  }
  throw new Error(`JSON incompleto no campo ${label}.`)
}
const optionalNumber = (value?: string) => value && Number.isFinite(Number(value)) ? Number(value) : undefined
const optionalBoolean = (value?: string) => value === 'true' ? true : value === 'false' ? false : undefined

export function parsePuterRegistry(raw: string) {
  const normalized = raw.replaceAll('\\n', '\n').replaceAll('\r', '')
  const declared = optionalNumber(normalized.match(/^TOTAL DE MODELOS:\s*(\d+)$/m)?.[1])
  const exportedAt = normalized.match(/^DATA:\s*(.+)$/m)?.[1]?.trim()
  const blocks = normalized.split(/-{20,}\nMODELO #\d+\n-{20,}\n/).slice(1)
  const models: RegistryModel[] = blocks.map((block, index) => {
    const puterId = line(block, 'PUTERID'); const modelId = line(block, 'ID'); const provider = line(block, 'PROVIDER')
    if (!modelId || !provider) throw new Error(`Modelo #${index + 1} não possui ID ou PROVIDER exato.`)
    const aliases = jsonField(block, 'ALIASES'); const modalities = jsonField(block, 'MODALITIES'); const costs = jsonField(block, 'COSTS') as Record<string, unknown> | undefined
    const inputKey = line(block, 'INPUT_COST_KEY'); const outputKey = line(block, 'OUTPUT_COST_KEY')
    return {
      id: modelId,
      provider,
      name: line(block, 'NAME'),
      aliases: Array.isArray(aliases) ? aliases.filter((value): value is string => typeof value === 'string') : [],
      context: optionalNumber(line(block, 'CONTEXT')),
      max_tokens: optionalNumber(line(block, 'MAX_TOKENS')),
      cost: { input: inputKey ? optionalNumber(String(costs?.[inputKey])) : undefined, output: outputKey ? optionalNumber(String(costs?.[outputKey])) : undefined },
      puterId,
      modalities,
      open_weights: optionalBoolean(line(block, 'OPEN_WEIGHTS')),
      tool_call: optionalBoolean(line(block, 'TOOL_CALL')),
      knowledge: line(block, 'KNOWLEDGE'),
      release_date: line(block, 'RELEASE_DATE'),
      costs,
      costs_currency: line(block, 'COSTS_CURRENCY'),
      input_cost_key: inputKey,
      output_cost_key: outputKey,
    }
  })
  if (declared !== undefined && models.length !== declared) throw new Error(`Registro incompleto: declarou ${declared} modelos, mas ${models.length} foram interpretados.`)
  const canonical = new Set(models.map(model => `${model.provider}\u0000${model.id}`))
  if (canonical.size !== models.length) throw new Error(`Registro possui ${models.length - canonical.size} combinações provider/id duplicadas.`)
  return { models, declared, exportedAt }
}
