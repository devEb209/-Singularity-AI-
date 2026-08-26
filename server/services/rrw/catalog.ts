import type { PhenomenonSpec, RealityDescription, RealityDomain } from './types.js'

const domain = (
  id: string,
  name: string,
  family: string,
  conserved: RealityDomain['conserved'],
  typicalDescription: RealityDescription,
): RealityDomain => ({
  id,
  name,
  family,
  conserved,
  typicalDescription,
  closed: false,
  source: 'internal-reference',
})

const spec = (
  id: string,
  family: string,
  requiredKnowledge: string[],
  conserved: PhenomenonSpec['conserved'],
  defaultDescription: RealityDescription,
): PhenomenonSpec => ({
  id,
  family,
  requiredKnowledge,
  conserved,
  defaultDescription,
  closedList: false,
})

export const seedDomains: RealityDomain[] = [
  domain('matter', 'Matter', 'matter', ['mass', 'energy'], 'continuum'),
  domain('energy', 'Energy', 'energy', ['energy'], 'continuum'),
  domain('particles', 'Particles', 'particles', ['mass', 'charge', 'momentum'], 'statistical'),
  domain('atoms', 'Atoms', 'atoms', ['mass', 'charge'], 'statistical'),
  domain('molecules', 'Molecules', 'molecules', ['mass', 'energy'], 'continuum'),
  domain('fields', 'Fields', 'fields', ['energy'], 'spectral-transport'),
  domain('forces', 'Forces', 'forces', ['momentum', 'energy'], 'law'),
  domain('light', 'Light', 'light', ['energy'], 'spectral-transport'),
  domain('radiation', 'Radiation', 'radiation', ['energy'], 'spectral-transport'),
  domain('space', 'Space', 'space', [], 'law'),
  domain('time', 'Time', 'time', [], 'law'),
  domain('life', 'Life', 'life', ['mass', 'energy'], 'discrete-body'),
  domain('organisms', 'Organisms', 'organisms', ['mass', 'energy'], 'discrete-body'),
  domain('chemistry', 'Chemistry', 'chemistry', ['mass', 'energy'], 'continuum'),
  domain('physics', 'Physics', 'physics', ['mass', 'energy', 'momentum', 'charge'], 'continuum'),
  domain('biology', 'Biology', 'biology', ['mass', 'energy'], 'discrete-body'),
  domain('astronomy', 'Astronomy', 'astronomy', ['mass', 'energy', 'momentum'], 'law'),
  domain('geology', 'Geology', 'geology', ['mass', 'energy'], 'continuum'),
  domain('climate', 'Climate', 'climate', ['energy', 'mass'], 'statistical'),
  domain('oceans', 'Oceans', 'oceans', ['mass', 'energy'], 'continuum'),
  domain('atmosphere', 'Atmosphere', 'atmosphere', ['mass', 'energy'], 'continuum'),
  domain('sound', 'Sound', 'sound', ['energy', 'momentum'], 'continuum'),
  domain('perception', 'Perception', 'perception', ['energy'], 'interactive-local'),
  domain('electricity', 'Electricity', 'electricity', ['charge', 'energy'], 'continuum'),
  domain('magnetism', 'Magnetism', 'magnetism', ['energy'], 'continuum'),
  domain('plasma', 'Plasma', 'plasma', ['mass', 'charge', 'energy'], 'continuum'),
  domain('thermodynamics', 'Thermodynamics', 'thermodynamics', ['energy'], 'continuum'),
  domain('ecology', 'Ecology', 'ecology', ['mass', 'energy'], 'statistical'),
  domain('society', 'Society', 'society', ['energy'], 'statistical'),
  domain('information', 'Information', 'information', [], 'law'),
]

export const seedPhenomena: PhenomenonSpec[] = [
  spec('combustion', 'chemistry', ['C', 'O2', 'temperature'], ['mass', 'energy'], 'interactive-local'),
  spec('phase-change', 'thermodynamics', ['meltK', 'boilK'], ['mass', 'energy'], 'continuum'),
  spec('gravitation', 'forces', ['mass', 'G'], ['momentum', 'energy'], 'law'),
  spec('spectral-coupling', 'light', ['absorption', 'observer'], ['energy'], 'spectral-transport'),
  spec('acoustic-travel', 'sound', ['medium', 'temperature'], ['energy'], 'continuum'),
  spec('organism-need', 'organisms', ['O2', 'H2O', 'temperature'], ['energy'], 'discrete-body'),
  spec('photosynthesis', 'biology', ['CO2', 'H2O', 'light'], ['mass', 'energy'], 'continuum'),
  spec('ocean-water', 'oceans', ['H2O'], ['mass'], 'continuum'),
  spec('atmospheric-mix', 'atmosphere', ['N2', 'O2'], ['mass'], 'continuum'),
  spec('stellar-emission', 'astronomy', ['H', 'T^4'], ['energy'], 'law'),
  spec('open-unknown', 'information', [], [], 'law'),
]

const extraDomains: RealityDomain[] = []
const extraPhenomena: PhenomenonSpec[] = []

export const catalogIsClosed = false as const

export const listDomains = () => [...seedDomains, ...extraDomains]

export const listPhenomena = () => [...seedPhenomena, ...extraPhenomena]

export const registerDomain = (item: RealityDomain) => {
  if (item.closed) throw new Error('RRW catalog refuses a closed domain')
  extraDomains.push({ ...item, closed: false })
  return item
}

export const registerPhenomenon = (item: PhenomenonSpec) => {
  extraPhenomena.push({ ...item, closedList: false })
  return item
}

export const catalogSnapshot = () => ({
  open: true as const,
  closedList: false as const,
  exhaustiveInternetClaim: false as const,
  domains: listDomains().length,
  phenomena: listPhenomena().length,
  note: 'Any describable phenomenon can be ingested. Seed list is not the universe.',
})
