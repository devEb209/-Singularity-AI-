export type Rock = 'basalt' | 'granite' | 'sediment' | 'ice' | 'sand'

export const rockAt = (height: number, temperature: number): Rock => {
  if (height <= 0) return 'basalt'
  if (temperature < -5) return 'ice'
  if (height > 0.7) return 'granite'
  if (height < 0.12) return 'sand'
  return 'sediment'
}
