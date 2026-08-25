import type { Settlement } from '../ues-world/types.js'
import { rng, type Cell } from '../ues-shared/math.js'
import { districtAt } from './districts.js'
import type { District } from './types.js'
import type { Citizen } from './types.js'

const occupations = ['baker', 'clerk', 'smith', 'guard', 'healer', 'farmer', 'carrier', 'teacher']

export const seedCensus = (seed: string, settlements: Settlement[], districts: District[], count = 96): Citizen[] => {
  const random = rng(seed.length * 17 + 9)
  const buildings = settlements.flatMap(item => item.buildings)
  const homes = buildings.length ? buildings : districts.map(item => ({ x: item.cx, z: item.cz, kind: 'house', settlementId: item.id }))
  const works = buildings.filter(item => item.kind !== 'house')
  const workPool = works.length ? works : homes
  return Array.from({ length: count }, (_, index) => {
    const homeBuilding = homes[index % homes.length]
    const workBuilding = workPool[(index * 3) % workPool.length]
    const home: Cell = [homeBuilding.x, homeBuilding.z]
    const work: Cell = [workBuilding.x, workBuilding.z]
    const relevance = index < 16 ? 0.92 : index < 40 ? 0.45 : 0.1
    return {
      id: `c-${index}`,
      home,
      work,
      districtId: districtAt(districts, home).id,
      workDistrictId: districtAt(districts, work).id,
      occupation: occupations[index % occupations.length],
      hour: 6,
      cell: home,
      fidelity: relevance > 0.8 ? 'full' : relevance > 0.3 ? 'medium' : 'dormant',
      lastAction: 'sleep',
    }
  })
}
