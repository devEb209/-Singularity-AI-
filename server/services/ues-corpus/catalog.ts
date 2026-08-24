import type { CorpusEntry, CorpusPart } from './types.js'

const part = (name: string, parent: string | null, position: CorpusPart['position'], radius: CorpusPart['radius'], fn: string, material = 'primary'): CorpusPart =>
  ({ name, parent, position, radius, material, function: fn })

export const catalog: CorpusEntry[] = [
  {
    id: 'humanoid-01',
    kind: 'humanoid',
    prompt: 'personagem humano em pé',
    parts: [
      part('pelvis', null, [0, 0.95, 0], [0.18, 0.12, 0.12], 'structure'),
      part('torso', 'pelvis', [0, 1.25, 0], [0.22, 0.22, 0.14], 'structure'),
      part('head', 'torso', [0, 1.62, 0], [0.11, 0.13, 0.11], 'skin', 'skin'),
      part('l-upper-arm', 'torso', [-0.32, 1.32, 0], [0.07, 0.16, 0.07], 'locomotion'),
      part('l-lower-arm', 'l-upper-arm', [-0.32, 1.02, 0], [0.06, 0.15, 0.06], 'locomotion'),
      part('r-upper-arm', 'torso', [0.32, 1.32, 0], [0.07, 0.16, 0.07], 'locomotion'),
      part('r-lower-arm', 'r-upper-arm', [0.32, 1.02, 0], [0.06, 0.15, 0.06], 'locomotion'),
      part('l-upper-leg', 'pelvis', [-0.1, 0.62, 0], [0.08, 0.2, 0.08], 'locomotion'),
      part('l-lower-leg', 'l-upper-leg', [-0.1, 0.24, 0], [0.07, 0.18, 0.07], 'locomotion'),
      part('r-upper-leg', 'pelvis', [0.1, 0.62, 0], [0.08, 0.2, 0.08], 'locomotion'),
      part('r-lower-leg', 'r-upper-leg', [0.1, 0.24, 0], [0.07, 0.18, 0.07], 'locomotion'),
    ],
  },
  {
    id: 'quadruped-01',
    kind: 'quadruped',
    prompt: 'urso quadrupede',
    parts: [
      part('torso', null, [0, 1.15, 0], [0.7, 0.38, 0.32], 'structure'),
      part('head', 'torso', [0.72, 1.42, 0], [0.28, 0.24, 0.24], 'skin', 'skin'),
      part('muzzle', 'head', [0.98, 1.3, 0], [0.16, 0.12, 0.14], 'skin', 'skin'),
      part('leg-fl', 'torso', [0.38, 0.5, -0.22], [0.12, 0.4, 0.12], 'locomotion'),
      part('leg-fr', 'torso', [0.38, 0.5, 0.22], [0.12, 0.4, 0.12], 'locomotion'),
      part('leg-bl', 'torso', [-0.38, 0.5, -0.22], [0.13, 0.4, 0.13], 'locomotion'),
      part('leg-br', 'torso', [-0.38, 0.5, 0.22], [0.13, 0.4, 0.13], 'locomotion'),
    ],
  },
  {
    id: 'vehicle-01',
    kind: 'vehicle',
    prompt: 'carro utilitario',
    parts: [
      part('chassis', null, [0, 0.35, 0], [1.1, 0.18, 0.45], 'structure', 'metal'),
      part('cabin', 'chassis', [-0.15, 0.7, 0], [0.45, 0.28, 0.4], 'structure', 'glass'),
      part('wheel-fl', 'chassis', [0.7, 0.18, -0.42], [0.16, 0.16, 0.08], 'locomotion', 'rubber'),
      part('wheel-fr', 'chassis', [0.7, 0.18, 0.42], [0.16, 0.16, 0.08], 'locomotion', 'rubber'),
      part('wheel-bl', 'chassis', [-0.7, 0.18, -0.42], [0.16, 0.16, 0.08], 'locomotion', 'rubber'),
      part('wheel-br', 'chassis', [-0.7, 0.18, 0.42], [0.16, 0.16, 0.08], 'locomotion', 'rubber'),
    ],
  },
  {
    id: 'chair-01',
    kind: 'chair',
    prompt: 'cadeira de madeira',
    parts: [
      part('seat', null, [0, 0.45, 0], [0.28, 0.04, 0.28], 'structure', 'wood'),
      part('back', 'seat', [0, 0.78, -0.24], [0.26, 0.32, 0.04], 'structure', 'wood'),
      part('leg-fl', 'seat', [-0.22, 0.22, -0.22], [0.035, 0.22, 0.035], 'support', 'wood'),
      part('leg-fr', 'seat', [0.22, 0.22, -0.22], [0.035, 0.22, 0.035], 'support', 'wood'),
      part('leg-bl', 'seat', [-0.22, 0.22, 0.22], [0.035, 0.22, 0.035], 'support', 'wood'),
      part('leg-br', 'seat', [0.22, 0.22, 0.22], [0.035, 0.22, 0.035], 'support', 'wood'),
    ],
  },
  {
    id: 'tree-01',
    kind: 'tree',
    prompt: 'arvore isolada',
    parts: [
      part('trunk', null, [0, 0.7, 0], [0.12, 0.7, 0.12], 'structure', 'bark'),
      part('crown', 'trunk', [0, 1.7, 0], [0.55, 0.5, 0.55], 'canopy', 'leaf'),
    ],
  },
  {
    id: 'crate-01',
    kind: 'crate',
    prompt: 'caixa de suprimentos',
    parts: [
      part('box', null, [0, 0.25, 0], [0.25, 0.25, 0.25], 'structure', 'wood'),
    ],
  },
]

export const byKind = (kind: CorpusEntry['kind']) => catalog.filter(item => item.kind === kind)
export const byPrompt = (prompt: string) => {
  const lower = prompt.toLowerCase()
  if (/humano|personagem|hero/.test(lower)) return catalog.find(item => item.kind === 'humanoid')!
  if (/urso|bear|quadruped/.test(lower)) return catalog.find(item => item.kind === 'quadruped')!
  if (/carro|veiculo|vehicle/.test(lower)) return catalog.find(item => item.kind === 'vehicle')!
  if (/cadeira|chair/.test(lower)) return catalog.find(item => item.kind === 'chair')!
  if (/arvore|tree/.test(lower)) return catalog.find(item => item.kind === 'tree')!
  if (/caixa|crate/.test(lower)) return catalog.find(item => item.kind === 'crate')!
  return catalog[0]
}
