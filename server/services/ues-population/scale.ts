export type Cognition = 'full' | 'reduced' | 'group' | 'statistical' | 'dormant'

export interface PopulationBand {
  cognition: Cognition
  agents: number
  uniqueMinds: boolean
}

export const planPopulation = (requested = 1_000_000, viewerNear = 64): PopulationBand[] => [
  { cognition: 'full', agents: viewerNear, uniqueMinds: true },
  { cognition: 'reduced', agents: 256, uniqueMinds: true },
  { cognition: 'group', agents: 4096, uniqueMinds: false },
  { cognition: 'statistical', agents: Math.max(0, requested - viewerNear - 256 - 4096), uniqueMinds: false },
  { cognition: 'dormant', agents: 0, uniqueMinds: false },
]

export const compactCells = (statistical: number, cells = 64) => {
  const per = Math.floor(statistical / cells)
  return Array.from({ length: cells }, (_, index) => ({ cell: index, count: per + (index < statistical % cells ? 1 : 0) }))
}

export const reconstructNear = (bands: PopulationBand[]) =>
  bands.filter(item => item.uniqueMinds).reduce((sum, item) => sum + item.agents, 0)
