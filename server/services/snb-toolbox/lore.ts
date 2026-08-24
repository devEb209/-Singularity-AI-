export type CanonLayer = 'main' | 'archived' | 'alternate' | 'community' | 'fan'

export interface LoreLine {
  id: string
  layer: CanonLayer
  title: string
  active: boolean
}

export const seedLore = (): LoreLine[] => [
  { id: 'main-a', layer: 'main', title: 'Linha principal A', active: true },
  { id: 'old-b', layer: 'archived', title: 'Linha antiga B', active: false },
  { id: 'alt-c', layer: 'alternate', title: 'Universo C', active: true },
  { id: 'comm-d', layer: 'community', title: 'Canon comunitário D', active: true },
]

export const chooseMain = (lines: LoreLine[], next: string) =>
  lines.map(line => {
    if (line.id === next) return { ...line, layer: 'main' as const, active: true }
    if (line.layer === 'main') return { ...line, layer: 'archived' as const, active: false }
    return line
  })

export const nothingErased = (before: LoreLine[], after: LoreLine[]) =>
  before.every(line => after.some(item => item.id === line.id))
