export type MaterialClass = 'dielectric' | 'conductor' | 'organic' | 'mineral' | 'fluid' | 'fabric' | 'skin' | 'vegetation' | 'custom'

export interface PbrLayers {
  albedo: [number, number, number]
  roughness: number
  metalness: number
  ior: number
  subsurface: number
  anisotropy: number
  emission: [number, number, number]
  heightAmp: number
  wetness: number
  wear: number
  dust: number
  temperatureK: number
}

export interface TitkoPbrMaterial {
  id: string
  prompt: string
  class: MaterialClass
  virtualK: 16384 | 32768
  layers: PbrLayers
  storedBitmap16k: false
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const base = (partial: Partial<PbrLayers>): PbrLayers => ({
  albedo: [0.45, 0.42, 0.38],
  roughness: 0.55,
  metalness: 0,
  ior: 1.5,
  subsurface: 0,
  anisotropy: 0,
  emission: [0, 0, 0],
  heightAmp: 0.08,
  wetness: 0,
  wear: 0,
  dust: 0,
  temperatureK: 293,
  ...partial,
})

export const compileMaterialPrompt = (prompt: string): TitkoPbrMaterial => {
  const text = prompt.toLowerCase()
  let material: TitkoPbrMaterial = {
    id: 'custom',
    prompt,
    class: 'custom',
    virtualK: 16384,
    layers: base({}),
    storedBitmap16k: false,
  }
  if (/granit|rocha|pedra|stone/.test(text)) {
    material = { ...material, id: 'granite', class: 'mineral', layers: base({ albedo: [0.42, 0.4, 0.38], roughness: 0.62, heightAmp: 0.14 }) }
  } else if (/aço|aco|steel|ferro|metal|ouro|gold|cobre/.test(text)) {
    material = { ...material, id: 'metal', class: 'conductor', virtualK: 32768, layers: base({ albedo: [0.72, 0.73, 0.74], roughness: 0.22, metalness: 0.94, ior: 2.5, heightAmp: 0.03 }) }
  } else if (/couro|leather/.test(text)) {
    material = { ...material, id: 'leather', class: 'organic', layers: base({ albedo: [0.38, 0.18, 0.12], roughness: 0.58, subsurface: 0.08 }) }
  } else if (/água|agua|water|oceano|mar/.test(text)) {
    material = { ...material, id: 'water', class: 'fluid', layers: base({ albedo: [0.02, 0.08, 0.12], roughness: 0.06, ior: 1.333, heightAmp: 0.2 }) }
  } else if (/neve|snow|gelo|ice/.test(text)) {
    material = { ...material, id: 'snow', class: 'dielectric', layers: base({ albedo: [0.92, 0.94, 0.96], roughness: 0.72, subsurface: 0.45, ior: 1.31 }) }
  } else if (/madeira|wood|carvalho|oak/.test(text)) {
    material = { ...material, id: 'wood', class: 'organic', layers: base({ albedo: [0.45, 0.28, 0.14], roughness: 0.64, anisotropy: 0.35 }) }
  } else if (/tecido|cloth|algodao|algodão|fabric/.test(text)) {
    material = { ...material, id: 'fabric', class: 'fabric', layers: base({ albedo: [0.55, 0.52, 0.48], roughness: 0.82, subsurface: 0.12 }) }
  } else if (/pele|skin|rosto/.test(text)) {
    material = { ...material, id: 'skin', class: 'skin', layers: base({ albedo: [0.62, 0.45, 0.36], roughness: 0.48, subsurface: 0.55, ior: 1.4 }) }
  } else if (/folha|grama|veget|leaf|grass/.test(text)) {
    material = { ...material, id: 'leaf', class: 'vegetation', layers: base({ albedo: [0.18, 0.38, 0.12], roughness: 0.52, subsurface: 0.28 }) }
  }
  const layers = { ...material.layers }
  if (/molhad|wet|chuva/.test(text)) {
    layers.wetness = 0.7
    layers.roughness = clamp01(layers.roughness * 0.45)
    layers.albedo = layers.albedo.map(channel => channel * 0.72) as [number, number, number]
  }
  if (/velh|worn|desgast|enferruj|rust/.test(text)) {
    layers.wear = 0.65
    layers.roughness = clamp01(layers.roughness + 0.18)
    layers.metalness = clamp01(layers.metalness * 0.55)
  }
  if (/poeira|dust|sujo/.test(text)) {
    layers.dust = 0.4
    layers.albedo = layers.albedo.map(channel => channel * 0.85 + 0.08) as [number, number, number]
  }
  if (/vermelh|red/.test(text)) layers.albedo = [0.62, 0.12, 0.1]
  if (/azul|blue/.test(text)) layers.albedo = [0.12, 0.22, 0.62]
  if (/preto|black/.test(text)) layers.albedo = [0.04, 0.04, 0.045]
  if (/emissiv|neon|glow/.test(text)) layers.emission = [0.4, 0.7, 1]
  return { ...material, layers }
}

export const modulateEnvironment = (material: TitkoPbrMaterial, wetness = 0, temperatureK = 293): TitkoPbrMaterial => {
  const layers = { ...material.layers }
  layers.wetness = clamp01(layers.wetness + wetness)
  layers.temperatureK = temperatureK
  if (layers.wetness > 0) layers.roughness = clamp01(layers.roughness * (1 - 0.5 * layers.wetness))
  if (temperatureK < 273) layers.roughness = clamp01(layers.roughness + 0.08)
  return { ...material, layers, storedBitmap16k: false }
}
