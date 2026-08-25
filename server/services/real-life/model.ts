import type { PhysicsLaws, RealityMode, RealitySource, KnowledgeConfidence, EnvironmentNode, RealLifeRequest } from './types.js'
import { DomainCatalog } from './catalog.js'

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

export const baseLaws = (): PhysicsLaws => ({
  gravity: 9.81,
  restitution: 0.2,
  friction: 0.6,
  fluidDensity: 1.2,
  wind: 0,
  temperature: 293,
  energyConservation: true,
  deformation: 0.05,
  delayedGravity: false,
  squashStretch: 0,
  impossibleAllowed: false,
  magicSlots: [],
  declaredRules: ['causalidade local', 'conservação de energia'],
  energyGain: 0,
})

export const applyMode = (mode: RealityMode, custom: Partial<PhysicsLaws> = {}): { laws: PhysicsLaws; notes: string[] } => {
  const laws = { ...baseLaws(), ...custom }
  const notes: string[] = []
  if (mode === 'cartoon') {
    laws.delayedGravity = true
    laws.squashStretch = 0.65
    laws.restitution = Math.max(laws.restitution, 0.55)
    laws.declaredRules = ['squash-stretch', 'gravidade atrasada', 'causalidade cartunesca']
    notes.push('Cartoon altera regras deliberadamente; não é falha de física real.')
  } else if (mode === 'toon-force') {
    laws.impossibleAllowed = true
    laws.energyConservation = custom.energyConservation ?? false
    laws.squashStretch = 1
    laws.declaredRules = ['regras impossíveis permitidas se declaradas', 'coerência interna obrigatória']
    notes.push('Toon Force permite o impossível, mas exige regras declaradas e consistentes.')
  } else if (mode === 'fantasy') {
    laws.magicSlots = custom.magicSlots?.length ? custom.magicSlots : ['arcane-force', 'ritual-constraint']
    laws.declaredRules = ['princípios reais como base', 'magia como sistema adicional com custo']
    notes.push('Fantasia adiciona sistemas inexistentes sem descartar coerência.')
  } else if (mode === 'sci-fi') {
    laws.declaredRules = ['extrapolação de princípios reais', 'tecnologia imaginária com custo']
    notes.push('Ficção científica extrapola princípios; não inventa invariantes silenciosas.')
  } else if (mode === 'stylized') {
    laws.deformation = 0.2
    laws.declaredRules = ['esqueleto causal preservado', 'detalhe reduzido']
    notes.push('Estilização reduz complexidade e preserva a causa.')
  } else if (mode === 'surreal') {
    laws.impossibleAllowed = true
    laws.declaredRules = ['inversões deliberadas', 'invariantes declaradas pelo autor']
    notes.push('Surrealismo inverte relações escolhidas e mantém as invariantes declaradas.')
  } else if (mode === 'custom') {
    laws.declaredRules = custom.declaredRules?.length ? custom.declaredRules : ['regras customizadas devem ser explícitas']
    notes.push('Modo custom usa somente regras declaradas.')
  } else {
    notes.push('Real Life usa princípios reais como fundamento, não como prisão criativa.')
  }
  return { laws, notes }
}

export const checkLawConsistency = (laws: PhysicsLaws) => {
  const errors: string[] = []
  const warnings: string[] = []
  if (laws.energyConservation && laws.energyGain > 0) errors.push('energyConservation contradicts energyGain > 0')
  if (laws.energyConservation && laws.impossibleAllowed && laws.energyGain > 0) errors.push('impossible energy gain while conservation is required')
  if (!laws.impossibleAllowed && laws.gravity <= 0) errors.push('non-positive gravity requires impossibleAllowed or an explicit custom mode rule')
  if (laws.impossibleAllowed && laws.declaredRules.length === 0) errors.push('impossibleAllowed requires declaredRules')
  if (laws.temperature < 0) errors.push('temperature below absolute zero')
  if (laws.squashStretch > 0 && !laws.delayedGravity && !laws.impossibleAllowed) warnings.push('squash-stretch without delayed gravity is a stylization, not real-life')
  return { consistent: errors.length === 0, errors, warnings }
}

export const environmentGraph = (seed: Partial<Record<string, number>> = {}): EnvironmentNode[] => {
  const ids = ['climate', 'water', 'soil', 'vegetation', 'fauna', 'human', 'lighting', 'materials', 'atmosphere'] as const
  const edges: [string, string, number][] = [
    ['climate', 'water', 0.55], ['climate', 'atmosphere', 0.7], ['climate', 'vegetation', 0.45], ['climate', 'lighting', 0.35],
    ['water', 'soil', 0.5], ['water', 'vegetation', 0.6], ['water', 'fauna', 0.35], ['water', 'climate', 0.25],
    ['soil', 'vegetation', 0.65], ['soil', 'water', 0.3], ['soil', 'materials', 0.2],
    ['vegetation', 'fauna', 0.55], ['vegetation', 'atmosphere', 0.3], ['vegetation', 'soil', 0.25], ['vegetation', 'lighting', 0.15],
    ['fauna', 'vegetation', 0.25], ['fauna', 'human', 0.2],
    ['human', 'water', 0.25], ['human', 'soil', 0.2], ['human', 'materials', 0.45], ['human', 'lighting', 0.2], ['human', 'fauna', 0.2],
    ['lighting', 'atmosphere', 0.35], ['lighting', 'materials', 0.3], ['lighting', 'vegetation', 0.2],
    ['materials', 'lighting', 0.25], ['materials', 'human', 0.15],
    ['atmosphere', 'lighting', 0.45], ['atmosphere', 'climate', 0.4], ['atmosphere', 'human', 0.15],
  ]
  return ids.map(id => ({
    id,
    value: clamp(seed[id] ?? 0.5),
    incoming: edges.filter(edge => edge[1] === id).map(([from, , weight]) => ({ from, weight })),
  }))
}

export const propagateEnvironment = (graph: EnvironmentNode[], node: string, magnitude: number) => {
  const state = new Map(graph.map(item => [item.id, { ...item, value: item.value }]))
  if (!state.has(node)) throw new Error(`Unknown environment node: ${node}`)
  state.get(node)!.value = clamp(state.get(node)!.value + magnitude)
  const order = ['climate', 'water', 'soil', 'vegetation', 'fauna', 'human', 'lighting', 'materials', 'atmosphere']
  for (let hop = 0; hop < 4; hop++) {
    const snapshot = new Map([...state].map(([id, item]) => [id, item.value]))
    for (const id of order) {
      const item = state.get(id)!
      const influx = item.incoming.reduce((sum, edge) => sum + (snapshot.get(edge.from)! - 0.5) * edge.weight * (0.55 ** hop), 0)
      item.value = clamp(item.value + influx * 0.35)
    }
  }
  const affected = [...state.values()]
    .map(item => ({ id: item.id, value: Number(item.value.toFixed(4)), delta: Number((item.value - (graph.find(nodeItem => nodeItem.id === item.id)?.value ?? 0.5)).toFixed(4)) }))
    .filter(item => Math.abs(item.delta) >= 0.01)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  return { nodes: [...state.values()], affected, hops: 4, rule: 'Simulate only coupled systems that change the objective.' }
}

export const classifyKnowledge = (sources: RealitySource[]): { confidence: KnowledgeConfidence; usableAsFact: boolean; reason: string } => {
  const independent = sources.filter(item => item.independent).length
  const tested = sources.some(item => item.tested)
  const contradiction = sources.some(item => (item.contradicts ?? []).length > 0)
  if (!sources.length) return { confidence: 'speculation', usableAsFact: false, reason: 'No sources supplied; treat as speculation.' }
  if (contradiction) return { confidence: 'uncertain', usableAsFact: false, reason: 'Contradictory sources cannot become facts.' }
  if (tested && independent >= 2) return { confidence: 'established', usableAsFact: true, reason: 'Independent sources plus a test.' }
  if (independent >= 2) return { confidence: 'strong-evidence', usableAsFact: true, reason: 'At least two independent sources agree.' }
  if (independent === 1 && !contradiction) return { confidence: 'moderate-evidence', usableAsFact: false, reason: 'Single independent source; useful, not a fact.' }
  return { confidence: 'hypothesis', usableAsFact: false, reason: 'Inferred or non-independent material.' }
}

export const abstractPhenomenon = (request: RealLifeRequest, catalog: DomainCatalog) => {
  const text = `${request.objective} ${request.phenomenon ?? ''}`
  const matched = catalog.match(text)
  const selected = request.domains?.length
    ? request.domains.map(id => catalog.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : matched.slice(0, 6).map(item => item.item)
  const knowledge = classifyKnowledge(request.sources ?? [])
  const rules = selected.flatMap(domain => domain.principles.map(principle => ({ domain: domain.id, principle })))
  const relations = [...new Set(selected.flatMap(domain => domain.relations))]
  const behaviors = selected.map(domain => ({ domain: domain.id, behavior: `Aplicar ${domain.purpose} somente onde o objetivo exigir precisão.` }))
  const parameters = Object.fromEntries(selected.map(domain => [domain.id, { relevance: matched.find(item => item.item.id === domain.id)?.score ?? 1, simulate: (matched.find(item => item.item.id === domain.id)?.score ?? 1) >= 2 }]))
  return {
    selected,
    pipeline: [
      { stage: 'observe', output: request.phenomenon ?? request.objective },
      { stage: 'research', output: `${(request.sources ?? []).length} fontes internas classificadas` },
      { stage: 'comprehend', output: selected.map(item => item.id).join(', ') || 'nenhum domínio semântico ainda' },
      { stage: 'abstract', output: `${rules.length} regras estruturais` },
      { stage: 'model', output: 'regras + relações + parâmetros, não cópia de dados' },
      { stage: 'simulate', output: 'somente o que importa para o objetivo' },
      { stage: 'integrate', output: relations.slice(0, 8) },
      { stage: 'validate', output: knowledge },
      { stage: 'optimize', output: 'D-O15 / perceptual equivalence / hardware' },
    ],
    knowledge: { ...knowledge, rules, relations, behaviors, parameters },
    notAMeshDump: true,
  }
}

export const graphicsPhenomena = (objective: string) => {
  const hay = objective.toLowerCase()
  const items = [
    { id: 'direct-light', importance: /noite|sombra|luz/.test(hay) ? 0.9 : 0.7 },
    { id: 'indirect-light', importance: /interior|global|gi/.test(hay) ? 0.8 : 0.45 },
    { id: 'shadows', importance: 0.7 },
    { id: 'reflection', importance: /metal|água|agua|vidro/.test(hay) ? 0.85 : 0.35 },
    { id: 'refraction', importance: /vidro|água|agua/.test(hay) ? 0.7 : 0.2 },
    { id: 'atmosphere', importance: /névoa|nevoa|distância|horizonte/.test(hay) ? 0.8 : 0.4 },
    { id: 'particles', importance: /fumaça|chuva|poeira|fogo/.test(hay) ? 0.75 : 0.25 },
    { id: 'materials', importance: 0.8 },
    { id: 'microstructure', importance: /pele|tecido|close/.test(hay) ? 0.7 : 0.2 },
    { id: 'camera', importance: /filme|lente|cinema/.test(hay) ? 0.8 : 0.4 },
    { id: 'perception', importance: 0.85 },
    { id: 'scale-distance', importance: /mundo|cidade|horizonte/.test(hay) ? 0.75 : 0.4 },
  ].sort((a, b) => b.importance - a.importance)
  return {
    goal: 'modelar os fenômenos que produzem a aparência percebida; não copiar uma fotografia',
    photorealismIsNotTheGoal: true,
    ranked: items,
  }
}
