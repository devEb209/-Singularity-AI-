import { catalogSnapshot, listDomains } from './catalog.js'
import { ingestStatement } from './ingest.js'
import { requireSubstance, substanceById } from './substances.js'
import type { KnowledgeClaim, MixturePart, RealityNode } from './types.js'

interface Cue {
  keys: string[]
  substanceId?: string
  kind: RealityNode['kind']
  domain: string
  label: string
}

const cues: Cue[] = [
  { keys: ['ocean', 'oceano', 'água', 'agua', 'water', 'mar', 'sea'], substanceId: 'H2O', kind: 'matter', domain: 'oceans', label: 'interpreted water' },
  { keys: ['sal', 'salt', 'salgado', 'halite'], substanceId: 'NaCl', kind: 'matter', domain: 'oceans', label: 'interpreted salt' },
  { keys: ['céu', 'ceu', 'sky', 'cloud', 'nuvem', 'nublado'], substanceId: 'N2', kind: 'field', domain: 'atmosphere', label: 'interpreted sky' },
  { keys: ['fogo', 'fire', 'chama', 'combust'], substanceId: 'C', kind: 'phenomenon', domain: 'chemistry', label: 'interpreted combustion' },
  { keys: ['floresta', 'tree', 'árvore', 'arvore', 'mata'], substanceId: 'C6H10O5', kind: 'living', domain: 'life', label: 'interpreted plant' },
  { keys: ['ferro', 'iron', 'metal'], substanceId: 'Fe', kind: 'matter', domain: 'matter', label: 'interpreted iron' },
  { keys: ['humano', 'human', 'pessoa', 'person'], substanceId: 'H2O', kind: 'living', domain: 'organisms', label: 'interpreted human' },
  { keys: ['solo', 'soil', 'terra', 'ground', 'rocha'], substanceId: 'SiO2', kind: 'structure', domain: 'geology', label: 'interpreted soil' },
  { keys: ['estrela', 'star', 'sol', 'sun'], substanceId: 'H', kind: 'phenomenon', domain: 'astronomy', label: 'interpreted star' },
  { keys: ['animal', 'bicho', 'fera'], substanceId: 'H2O', kind: 'living', domain: 'organisms', label: 'interpreted animal' },
  { keys: ['deserto', 'desert', 'duna', 'árido', 'arido'], substanceId: 'SiO2', kind: 'structure', domain: 'geology', label: 'interpreted desert' },
  { keys: ['neve', 'snow', 'gelo', 'ice', 'alpino', 'alpine'], substanceId: 'H2O', kind: 'matter', domain: 'climate', label: 'interpreted ice' },
  { keys: ['montanha', 'mountain', 'cume', 'serra'], substanceId: 'SiO2', kind: 'structure', domain: 'geology', label: 'interpreted mountain' },
  { keys: ['chuva', 'rain', 'precipita'], substanceId: 'H2O', kind: 'field', domain: 'climate', label: 'interpreted rain' },
]

const claim = (id: string, statement: string): KnowledgeClaim => ({
  id,
  statement,
  state: 'LIKELY',
  inferred: true,
  source: 'interpret',
})

const nodeFrom = (cue: Cue, index: number): RealityNode => {
  const substance = cue.substanceId ? requireSubstance(cue.substanceId) : undefined
  const inventory: MixturePart[] | undefined = cue.substanceId ? [{ substanceId: cue.substanceId, moles: cue.substanceId === 'H2O' ? 200 : 4 }] : undefined
  return {
    id: `interpreted-${index}-${cue.domain}`,
    kind: cue.kind,
    label: cue.label,
    substanceId: cue.substanceId,
    temperatureK: cue.label.includes('ice') ? 260 : cue.kind === 'phenomenon' && cue.substanceId === 'C' ? 900 : 290,
    pressurePa: 101325,
    phase: substance?.phase293 ?? 'mixture',
    extent: { kind: 'sphere', center: [index * 1.4, cue.kind === 'field' ? 6 : 0.4, 0], radius: 0.8 },
    living: cue.kind === 'living' ? { species: cue.domain === 'life' ? 'tree' : cue.label.includes('animal') ? 'animal' : 'human', identity: `interpreted-${index}`, consciousnessClaim: false } : undefined,
    emissionScale: cue.substanceId === 'C' ? 0.3 : 0,
    claims: [claim(`i-${index}`, `${cue.label} from description`)],
    inventory,
    domain: cue.domain,
  }
}

export const interpretDescription = (text: string) => {
  const hay = text.toLowerCase()
  const matched = cues.filter(cue => cue.keys.some(key => hay.includes(key)))
  const nodes = matched.map((cue, index) => nodeFrom(cue, index))
  if (matched.some(item => item.substanceId === 'NaCl') && matched.some(item => item.substanceId === 'H2O')) {
    const ocean = nodes.find(item => item.substanceId === 'H2O')
    if (ocean) ocean.inventory = [...(ocean.inventory ?? []), { substanceId: 'NaCl', moles: 6 }]
  }
  const unknown = matched.length === 0 ? ingestStatement(text) : undefined
  if (unknown) nodes.push(unknown.node)
  const substances = [...new Set(nodes.map(item => item.substanceId).filter((item): item is string => Boolean(item && substanceById(item))))]
  return {
    text,
    nodes,
    substances,
    domains: [...new Set(nodes.map(item => item.domain).filter(Boolean))],
    catalog: catalogSnapshot(),
    knownDomainCount: listDomains().length,
    heightfieldIsIdentity: false as const,
    meshIsFoundation: false as const,
    inferenceIsFact: false as const,
    traditionalAsset: false as const,
  }
}
