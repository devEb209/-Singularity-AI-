import { DomainCatalog, isValidDomainId } from './catalog.js'
import type { RealityDomain } from './types.js'

const slug = (text: string) => {
  const value = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  return value.length >= 2 ? value : `domain-${Math.abs(hashCode(text))}`
}

const hashCode = (text: string) => {
  let h = 0
  for (const char of text) h = Math.imul(31, h) + char.charCodeAt(0) | 0
  return h
}

const tokens = (text: string) => [...new Set(text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(item => item.length > 3))]

export const generateModule = (problem: string, catalog: DomainCatalog) => {
  const matches = catalog.match(problem)
  const best = matches[0]
  if (best && best.score >= 3) {
    return {
      status: 'reuse' as const,
      execution: false,
      reused: best.item.id,
      score: best.score,
      reason: 'An existing open domain already covers the problem well enough.',
    }
  }
  const extracted = tokens(problem).slice(0, 8)
  const id = isValidDomainId(slug(problem)) ? slug(problem) : `generated-${Math.abs(hashCode(problem))}`
  const spec: Omit<RealityDomain, 'closed' | 'seeded'> = {
    id,
    name: problem.slice(0, 80),
    category: 'custom',
    purpose: `Módulo gerado para: ${problem.slice(0, 180)}`,
    principles: extracted.length ? extracted.map(token => `princípio extraído: ${token}`) : ['declarar invariantes antes de simular'],
    relations: matches.slice(0, 4).map(item => item.item.id),
    applicableDs: ['D3', 'D5', 'D6', 'D12', 'D15'],
  }
  return {
    status: 'generated-spec' as const,
    execution: false,
    module: spec,
    tests: [
      'invariantes declaradas são verificáveis',
      'relações apontam para domínios existentes ou novos specs',
      'D-O15 recusa otimização que apague o objetivo',
    ],
    integration: ['registrar no catálogo aberto', 'ligar aos D relevantes', 'não executar código gerado automaticamente'],
    reason: 'Nenhum módulo existente cobria o problema com confiança suficiente. Spec only — no arbitrary code execution.',
  }
}
