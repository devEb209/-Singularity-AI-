import { cellulosePool, stepForage } from './economy.js'
import { composeWithStructures } from './structure.js'
import { molesOf } from './extent.js'

export const forageDays = (prompt = 'floresta com um humano e um abrigo', days = 3) => {
  let nodes = composeWithStructures(prompt).nodes
  const start = cellulosePool(nodes)
  const humanStart = molesOf(nodes.find(item => item.id === 'human')!, 'C6H10O5')
  let conserved = true
  for (let day = 0; day < days; day++) {
    const step = stepForage(nodes)
    conserved = conserved && step.conserved
    nodes = step.nodes
  }
  const humanEnd = molesOf(nodes.find(item => item.id === 'human')!, 'C6H10O5')
  return {
    days,
    start,
    after: cellulosePool(nodes),
    conserved: conserved && Math.abs(cellulosePool(nodes) - start) < 1e-9,
    humanGained: humanEnd > humanStart,
    scriptedLoot: false as const,
  }
}
