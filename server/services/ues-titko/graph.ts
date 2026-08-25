export interface TitkoMaterial {
  id: string
  name: string
  virtualK: 16384 | 32768
  mineral: 'granite' | 'soil' | 'metal' | 'wood' | 'water'
  seed: number
}

export const materials: TitkoMaterial[] = [
  { id: 'granite-01', name: 'Granite crust', virtualK: 16384, mineral: 'granite', seed: 11 },
  { id: 'soil-01', name: 'Organic soil', virtualK: 16384, mineral: 'soil', seed: 19 },
  { id: 'metal-01', name: 'Weathered steel', virtualK: 32768, mineral: 'metal', seed: 7 },
  { id: 'wood-01', name: 'Oak plank', virtualK: 16384, mineral: 'wood', seed: 23 },
]

export const storedBytes = (material: TitkoMaterial) => JSON.stringify(material).length

export const bitmapBytes = (k: number) => k * k * 3
