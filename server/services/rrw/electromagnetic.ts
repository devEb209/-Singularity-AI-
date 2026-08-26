export type EmBand = 'radio' | 'microwave' | 'infrared' | 'visible' | 'ultraviolet' | 'xray'

export const emAbsorption: Record<string, Record<EmBand, number>> = {
  N2: { radio: 0.0001, microwave: 0.0004, infrared: 0.01, visible: 0.008, ultraviolet: 0.08, xray: 0.02 },
  H2O: { radio: 0.02, microwave: 0.35, infrared: 2.4, visible: 0.08, ultraviolet: 1.8, xray: 0.4 },
  Fe: { radio: 8, microwave: 12, infrared: 16, visible: 24, ultraviolet: 30, xray: 6 },
}

export const transmitEm = (substanceId: string, band: EmBand, path: number, incident = 1) => {
  const mu = emAbsorption[substanceId]?.[band] ?? 0.05
  return incident * Math.exp(-mu * Math.max(0, path))
}

export const compareEm = () => {
  const airVis = transmitEm('N2', 'visible', 8)
  const waterMicrowave = transmitEm('H2O', 'microwave', 8)
  const waterVis = transmitEm('H2O', 'visible', 8)
  const ironRadio = transmitEm('Fe', 'radio', 0.02)
  return {
    airVis,
    waterVis,
    waterMicrowave,
    ironRadio,
    waterBlocksMicrowaveMoreThanAir: waterMicrowave < airVis,
    rayTraced: false as const,
  }
}
