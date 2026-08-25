import { acousticTravel } from './acoustics.js'
import { electricFieldAt } from './charge.js'
import { climateAt } from './climate.js'
import { accelerationAt, potentialAt } from './gravity.js'
import { magneticFieldAt, magneticStrength } from './magnetism.js'
import { transport } from './coupling.js'
import { solarSpectrum } from './spectrum.js'
import type { FieldKind, FieldSample, RealityNode } from './types.js'

export const sampleField = (kind: FieldKind, nodes: RealityNode[], point: [number, number, number]): FieldSample => {
  if (kind === 'gravity') {
    const vector = accelerationAt(nodes, point)
    return { kind, scalar: potentialAt(nodes, point), vector, rayTraced: false, shaderField: false }
  }
  if (kind === 'electric') {
    const vector = electricFieldAt(nodes, point)
    return { kind, scalar: Math.hypot(...vector), vector, rayTraced: false, shaderField: false }
  }
  if (kind === 'magnetic') {
    const vector = magneticFieldAt(nodes, point)
    return { kind, scalar: magneticStrength(vector), vector, rayTraced: false, shaderField: false }
  }
  if (kind === 'thermal') {
    const climate = climateAt(nodes, point)
    return { kind, scalar: climate.temperatureK, vector: [0, -6.5, 0], rayTraced: false, shaderField: false }
  }
  if (kind === 'pressure') {
    const climate = climateAt(nodes, point)
    return { kind, scalar: climate.pressurePa, vector: [0, -climate.pressurePa / 8500, 0], rayTraced: false, shaderField: false }
  }
  if (kind === 'acoustic') {
    const air = nodes.find(item => item.id === 'atmosphere')
    const fire = nodes.find(item => item.id === 'fire')
    const travel = air && fire?.extent.center ? acousticTravel(fire.extent.center, point, air) : { attenuation: 1, seconds: 0 }
    return { kind, scalar: travel.attenuation, vector: [0, 0, travel.seconds], rayTraced: false, shaderField: false }
  }
  const light = transport({ sourceEmission: solarSpectrum(), media: [{ substanceId: 'N2', path: 4 }], observer: 'human-photopic' })
  return { kind: 'optical', scalar: light.luminance, vector: [0, 0, light.luminance], rayTraced: false, shaderField: false }
}

export const sampleAllFields = (nodes: RealityNode[], point: [number, number, number]) => {
  const kinds: FieldKind[] = ['gravity', 'electric', 'magnetic', 'thermal', 'pressure', 'acoustic', 'optical']
  return kinds.map(kind => sampleField(kind, nodes, point))
}
