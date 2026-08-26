import { centerOf } from './extent.js'
import { statementsOf } from './chronicle.js'
import type { RealityNode } from './types.js'

export const placeTag = (node: RealityNode) => {
  const point = centerOf(node)
  return `at=${point[0].toFixed(2)},${point[1].toFixed(2)},${point[2].toFixed(2)}`
}

export const parsePlace = (statement: string): [number, number, number] | undefined => {
  const match = statement.match(/at=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (!match) return undefined
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export const lastPlacedEvent = (nodes: RealityNode[], keys: string[] = ['forage', 'human:', 'fire cooled']) => {
  const statements = statementsOf(nodes)
  for (let index = statements.length - 1; index >= 0; index -= 1) {
    const statement = statements[index]
    if (!keys.some(key => statement.includes(key))) continue
    const at = parsePlace(statement)
    if (at) return { statement, at, found: true as const }
  }
  return { statement: '', at: undefined, found: false as const }
}
