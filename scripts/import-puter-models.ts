import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { config } from '../server/config.js'
import { SQLiteStore } from '../server/repositories/sqlite-store.js'
import { ModelCatalog, type PuterModelInput } from '../server/services/model-catalog.js'
import { parsePuterRegistry } from './parse-puter-registry.js'

const path = resolve(process.argv[2] ?? 'puter-models.txt')
const content = await readFile(path, 'utf8').catch(() => {
  throw new Error(`Arquivo não encontrado: ${path}. Anexe puter-models.txt ao repositório antes de importar.`)
})

function parse(raw: string): unknown[] {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('O arquivo de modelos está vazio.')
  if (trimmed.includes('PUTER AI — MODEL REGISTRY')) return parsePuterRegistry(trimmed).models
  try {
    const value = JSON.parse(trimmed) as unknown
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object' && Array.isArray((value as { models?: unknown }).models)) return (value as { models: unknown[] }).models
  } catch {
    const lines = trimmed.split(/\r?\n/).filter(Boolean)
    try { return lines.map(line => JSON.parse(line) as unknown) }
    catch { throw new Error('Formato inválido. Use o MODEL REGISTRY exportado, JSON array, {"models": [...]} ou NDJSON.') }
  }
  throw new Error('Formato inválido. O arquivo deve conter objetos retornados pelo script Puter, não nomes inferidos.')
}

const values = parse(content)
const models: PuterModelInput[] = values.map((value, index) => {
  if (!value || typeof value !== 'object') throw new Error(`Entrada ${index + 1} não é um objeto.`)
  const model = value as Record<string, unknown>
  if (typeof model.id !== 'string' || !model.id.trim()) throw new Error(`Entrada ${index + 1} não possui id exato.`)
  if (typeof model.provider !== 'string' || !model.provider.trim()) throw new Error(`Entrada ${index + 1} não possui provider exato.`)
  return model as PuterModelInput
})

const store = new SQLiteStore(resolve(config.DATABASE_PATH))
try {
  const result = new ModelCatalog(store).syncPuter(models)
  console.log(JSON.stringify({ source: path, ...result }, null, 2))
} finally { store.close() }
