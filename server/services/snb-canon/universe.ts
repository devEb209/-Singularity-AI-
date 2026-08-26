export type UniverseLayer = 'main' | 'archived' | 'alternate' | 'community' | 'fan'

export interface Universe {
  id: string
  title: string
  layer: UniverseLayer
  active: boolean
  parentId?: string
}

export interface LoreLink {
  from: string
  to: string
  relation: 'archives' | 'forks' | 'shares-asset' | 'contradicts'
}

export const seedUniverses = (): Universe[] => [
  { id: 'prime', title: 'Canon principal', layer: 'main', active: true },
  { id: 'old-cycle', title: 'Ciclo arquivado', layer: 'archived', active: false },
  { id: 'mirror', title: 'Universo espelho', layer: 'alternate', active: true, parentId: 'prime' },
  { id: 'commune', title: 'Lore comunitária', layer: 'community', active: true, parentId: 'prime' },
]

export const seedLinks = (): LoreLink[] => [
  { from: 'old-cycle', to: 'prime', relation: 'archives' },
  { from: 'mirror', to: 'prime', relation: 'forks' },
  { from: 'commune', to: 'prime', relation: 'shares-asset' },
]

export const promote = (universes: Universe[], next: string) =>
  universes.map(item => {
    if (item.id === next) return { ...item, layer: 'main' as const, active: true }
    if (item.layer === 'main') return { ...item, layer: 'archived' as const, active: false }
    return item
  })

export const nothingErased = (before: Universe[], after: Universe[]) =>
  before.every(item => after.some(entry => entry.id === item.id))
