export type WorldKind = 'earth-like' | 'fantasy' | 'sci-fi' | 'alien' | 'alternate'

export interface Mutation {
  field: 'seaLevel' | 'tilt' | 'ridge'
  delta: number
}

export interface WorldRecipe {
  kind: WorldKind
  seed: string
  mutations: Mutation[]
}

export const seaLevelOf = (recipe: WorldRecipe) =>
  recipe.mutations.filter(item => item.field === 'seaLevel').reduce((sum, item) => sum + item.delta, 0)

export const tiltOf = (recipe: WorldRecipe) =>
  recipe.mutations.filter(item => item.field === 'tilt').reduce((sum, item) => sum + item.delta, 0)
