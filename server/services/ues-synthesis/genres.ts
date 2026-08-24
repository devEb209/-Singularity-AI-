import type { WorldKind, WorldRecipe } from './recipe.js'

export interface GenreSpec {
  kind: WorldKind
  climateShift: number
  moistureShift: number
  continentBias: number
  magicAsRule: false
  knowledge: string
}

export const genreOf = (kind: WorldKind): GenreSpec => {
  if (kind === 'fantasy') return { kind, climateShift: 0.08, moistureShift: 0.12, continentBias: 0.05, magicAsRule: false, knowledge: 'terrestrial-rules-plus-named-exceptions' }
  if (kind === 'sci-fi') return { kind, climateShift: -0.05, moistureShift: -0.04, continentBias: 0, magicAsRule: false, knowledge: 'earth-physics-plus-tech-constraints' }
  if (kind === 'alien') return { kind, climateShift: 0.22, moistureShift: -0.18, continentBias: 0.15, magicAsRule: false, knowledge: 'plausible-exoplanet-from-earth-priors' }
  if (kind === 'alternate') return { kind, climateShift: 0.04, moistureShift: 0.02, continentBias: -0.04, magicAsRule: false, knowledge: 'counterfactual-earth' }
  return { kind, climateShift: 0, moistureShift: 0, continentBias: 0, magicAsRule: false, knowledge: 'earth-like-baseline' }
}

export const recipeFor = (kind: WorldKind, seed: string, seaDelta = 0): WorldRecipe => ({
  kind,
  seed,
  mutations: [
    { field: 'seaLevel', delta: seaDelta },
    { field: 'tilt', delta: genreOf(kind).climateShift },
    { field: 'ridge', delta: genreOf(kind).continentBias },
  ],
})
