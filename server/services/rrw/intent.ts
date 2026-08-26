export type BiomeKind = 'coast' | 'desert' | 'forest' | 'alpine' | 'wetland' | 'open'

const has = (hay: string, keys: string[]) => keys.some(key => hay.includes(key))

export const parseIntent = (prompt: string) => {
  const hay = prompt.toLowerCase()
  let biome: BiomeKind = 'open'
  if (has(hay, ['deserto', 'desert', 'árido', 'arido', 'sahara', 'duna'])) biome = 'desert'
  else if (has(hay, ['alpino', 'alpine', 'neve', 'snow', 'gelo', 'ice', 'montanha', 'mountain', 'cume'])) biome = 'alpine'
  else if (has(hay, ['floresta', 'forest', 'selva', 'jungle', 'mata', 'bosque'])) biome = 'forest'
  else if (has(hay, ['pântano', 'pantano', 'wetland', 'brejo', 'mangue'])) biome = 'wetland'
  else if (has(hay, ['oceano', 'ocean', 'praia', 'coast', 'litoral', 'mar ', 'mar,', 'shore'])) biome = 'coast'
  const domains = [
    biome === 'desert' || biome === 'alpine' || biome === 'wetland' ? 'geology' : '',
    biome === 'coast' || biome === 'wetland' ? 'oceans' : '',
    biome === 'forest' || biome === 'wetland' ? 'life' : '',
    'atmosphere',
    'organisms',
  ].filter(Boolean)
  return {
    prompt,
    biome,
    wantsFire: has(hay, ['fogo', 'fire', 'chama']),
    wantsLiving: has(hay, ['humano', 'human', 'pessoa', 'animal', 'árvore', 'arvore', 'tree', 'floresta']),
    wantsWater: has(hay, ['água', 'agua', 'water', 'oceano', 'rio', 'river']),
    domains,
    realismRequired: false as const,
    instantAaa: false as const,
  }
}
