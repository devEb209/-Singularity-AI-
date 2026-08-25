import { classOf, tokensOf, type EntityClass, type PartSpec } from './lexicon.js'

const part = (name: string, parent: string | null, position: PartSpec['position'], radius: PartSpec['radius'], fn: string, material = 'primary'): PartSpec =>
  ({ name, parent, position, radius, material, function: fn })

const recipes: Record<EntityClass, (prompt: string) => PartSpec[]> = {
  furniture: () => [
    part('top', null, [0, 0.72, 0], [0.55, 0.04, 0.35], 'structure', 'wood'),
    part('leg-fl', 'top', [-0.42, 0.36, -0.24], [0.04, 0.36, 0.04], 'support', 'wood'),
    part('leg-fr', 'top', [0.42, 0.36, -0.24], [0.04, 0.36, 0.04], 'support', 'wood'),
    part('leg-bl', 'top', [-0.42, 0.36, 0.24], [0.04, 0.36, 0.04], 'support', 'wood'),
    part('leg-br', 'top', [0.42, 0.36, 0.24], [0.04, 0.36, 0.04], 'support', 'wood'),
  ],
  weapon: () => [
    part('receiver', null, [0, 0.16, 0], [0.18, 0.05, 0.04], 'structure', 'metal'),
    part('barrel', 'receiver', [0.28, 0.17, 0], [0.22, 0.02, 0.02], 'structure', 'metal'),
    part('stock', 'receiver', [-0.22, 0.15, 0], [0.14, 0.04, 0.03], 'support', 'wood'),
    part('mag', 'receiver', [0.02, 0.08, 0], [0.04, 0.08, 0.02], 'structure', 'metal'),
  ],
  vehicle: () => [
    part('hull', null, [0, 0.28, 0], [0.7, 0.16, 0.32], 'structure', 'metal'),
    part('cabin', 'hull', [-0.1, 0.52, 0], [0.28, 0.16, 0.26], 'structure', 'glass'),
    part('rotor-fl', 'hull', [0.35, 0.42, -0.28], [0.12, 0.02, 0.12], 'locomotion', 'metal'),
    part('rotor-fr', 'hull', [0.35, 0.42, 0.28], [0.12, 0.02, 0.12], 'locomotion', 'metal'),
    part('rotor-bl', 'hull', [-0.35, 0.42, -0.28], [0.12, 0.02, 0.12], 'locomotion', 'metal'),
    part('rotor-br', 'hull', [-0.35, 0.42, 0.28], [0.12, 0.02, 0.12], 'locomotion', 'metal'),
  ],
  creature: () => [
    part('torso', null, [0, 1.1, 0], [0.28, 0.32, 0.18], 'structure'),
    part('head', 'torso', [0, 1.52, 0], [0.12, 0.13, 0.12], 'skin', 'skin'),
    part('arm-l', 'torso', [-0.32, 1.05, 0], [0.07, 0.28, 0.07], 'locomotion'),
    part('arm-r', 'torso', [0.32, 1.05, 0], [0.07, 0.28, 0.07], 'locomotion'),
    part('leg-l', 'torso', [-0.12, 0.45, 0], [0.08, 0.4, 0.08], 'locomotion'),
    part('leg-r', 'torso', [0.12, 0.45, 0], [0.08, 0.4, 0.08], 'locomotion'),
  ],
  architecture: () => [
    part('deck', null, [0, 0.35, 0], [1.1, 0.06, 0.28], 'structure', 'stone'),
    part('pier-l', 'deck', [-0.7, 0.16, 0], [0.1, 0.16, 0.16], 'support', 'stone'),
    part('pier-r', 'deck', [0.7, 0.16, 0], [0.1, 0.16, 0.16], 'support', 'stone'),
    part('arch-a', 'deck', [-0.25, 0.22, 0], [0.22, 0.12, 0.08], 'structure', 'stone'),
    part('arch-b', 'deck', [0.25, 0.22, 0], [0.22, 0.12, 0.08], 'structure', 'stone'),
  ],
  tool: () => [
    part('handle', null, [0, 0.18, 0], [0.04, 0.18, 0.04], 'support', 'wood'),
    part('head', 'handle', [0, 0.4, 0], [0.12, 0.06, 0.05], 'structure', 'metal'),
  ],
  machine: () => [
    part('chassis', null, [0, 0.2, 0], [0.35, 0.12, 0.22], 'structure', 'metal'),
    part('coil', 'chassis', [0, 0.38, 0], [0.14, 0.12, 0.14], 'structure', 'copper'),
    part('antenna', 'chassis', [0.18, 0.48, 0], [0.02, 0.16, 0.02], 'structure', 'metal'),
  ],
  apparel: () => [
    part('shell', null, [0, 1.3, 0], [0.18, 0.12, 0.16], 'structure', 'fabric'),
    part('visor', 'shell', [0.12, 1.3, 0], [0.06, 0.05, 0.1], 'structure', 'glass'),
  ],
  vessel: () => [
    part('hull', null, [0, 0.14, 0], [0.8, 0.12, 0.24], 'structure', 'wood'),
    part('mast', 'hull', [0.05, 0.55, 0], [0.03, 0.38, 0.03], 'support', 'wood'),
    part('sail', 'mast', [0.05, 0.62, 0.02], [0.02, 0.26, 0.2], 'structure', 'fabric'),
  ],
  prop: prompt => {
    const tokens = tokensOf(prompt).slice(0, 6)
    const names = tokens.length ? tokens : ['body']
    return names.map((name, index) => part(
      index === 0 ? 'body' : name,
      index === 0 ? null : 'body',
      [index === 0 ? 0 : (index - 2) * 0.18, index === 0 ? 0.25 : 0.4, 0],
      index === 0 ? [0.22, 0.22, 0.22] : [0.1, 0.1, 0.1],
      index === 0 ? 'structure' : 'attached',
    ))
  },
}

export const composeSemantic = (prompt: string) => {
  const kind = classOf(prompt)
  const parts = recipes[kind](prompt)
  const unique = new Set(parts.map(item => item.name)).size === parts.length
  const parents = parts.every(item => !item.parent || parts.some(candidate => candidate.name === item.parent))
  return {
    format: 'ues-semantic-object-v1' as const,
    identity: { kind, prompt, catalogBound: false },
    parts,
    relations: parts.filter(item => item.parent).map(item => ({ type: 'attached-to' as const, from: item.name, to: item.parent })),
    verification: { uniqueParts: unique, allParentsExist: parents, catalogBound: false },
  }
}
