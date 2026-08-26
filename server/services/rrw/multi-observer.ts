import { composeReality } from './compose.js'
import { observedLuminance, solarSpectrum } from './spectrum.js'
import { experienceAt } from './observer.js'
import type { RealityNode } from './types.js'

const fireSpectrum = () => ({
  uv: 0.05,
  violet: 0.1,
  blue: 0.22,
  green: 0.4,
  yellow: 0.72,
  red: 1,
  nir: 0.82,
  fir: 0.95,
})

export const compareObservers = (nodes?: RealityNode[]) => {
  const world = nodes ?? composeReality('oceano salgado com fogo').nodes
  const fire = fireSpectrum()
  const day = solarSpectrum()
  const humanFire = observedLuminance(fire, 'human-photopic')
  const thermalFire = observedLuminance(fire, 'thermal-ir')
  const thermalDay = observedLuminance(day, 'thermal-ir')
  const insectDay = observedLuminance(day, 'insect-uv')
  const humanDay = observedLuminance(day, 'human-photopic')
  const experience = experienceAt(world)
  return {
    thermalSeesFireMore: thermalFire > thermalDay,
    insectSeesDayUv: insectDay > 0,
    humanSeesVisibleDay: humanDay > insectDay,
    humanSeesFireVisible: humanFire > 0,
    sameReality: world.some(item => item.id === 'fire') && world.some(item => item.id === 'eye'),
    framebufferFoundation: experience.framebufferFoundation,
    pbr: experience.light.pbr,
  }
}
