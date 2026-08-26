import { composeReality } from './compose.js'
import { walkReality } from './walk.js'

export const compareNavScale = () => {
  const coast = walkReality('oceano salgado com um humano')
  const desert = walkReality('deserto quente com um humano')
  const forest = walkReality('floresta com um humano')
  return {
    coast,
    desert,
    forest,
    allFound: coast.found && desert.found && forest.found,
    recast: false as const,
    conceptualCap: false as const,
    nodes: composeReality('oceano salgado').nodes.length,
  }
}
