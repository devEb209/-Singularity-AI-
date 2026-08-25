import type { Settlement } from '../ues-world/types.js'
import { hypot2, type Cell } from '../ues-shared/math.js'
import type { District, DistrictKind } from './types.js'

const kinds: DistrictKind[] = ['residential', 'market', 'industrial', 'civic', 'park']

export const buildDistricts = (size: number, settlements: Settlement[]): District[] => {
  const seeds: { id: string; cx: number; cz: number; kind: DistrictKind }[] = settlements.map((settlement, index) => ({
    id: `d-${index}`,
    cx: settlement.cx,
    cz: settlement.cz,
    kind: kinds[index % kinds.length],
  }))
  const extras: Cell[] = [
    [2, 2],
    [size - 3, 2],
    [2, size - 3],
    [Math.floor(size / 2), Math.floor(size / 2)],
  ]
  for (const [cx, cz] of extras) {
    if (seeds.some(seed => hypot2([seed.cx, seed.cz], [cx, cz]) < size / 5)) continue
    seeds.push({ id: `d-x-${seeds.length}`, cx, cz, kind: kinds[seeds.length % kinds.length] })
  }
  const districts: District[] = seeds.map(seed => ({ ...seed, cells: [] }))
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      let best = 0
      let score = Infinity
      for (const [index, seed] of seeds.entries()) {
        const distance = hypot2([seed.cx, seed.cz], [x, z])
        if (distance < score) {
          score = distance
          best = index
        }
      }
      districts[best].cells.push([x, z])
    }
  }
  return districts.filter(item => item.cells.length > 0)
}

export const districtAt = (districts: District[], cell: Cell) =>
  districts.find(item => item.cells.some(point => point[0] === cell[0] && point[1] === cell[1])) ?? districts[0]
