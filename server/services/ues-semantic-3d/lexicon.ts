export type EntityClass =
  | 'furniture'
  | 'weapon'
  | 'vehicle'
  | 'creature'
  | 'architecture'
  | 'tool'
  | 'machine'
  | 'apparel'
  | 'vessel'
  | 'prop'

export interface PartSpec {
  name: string
  parent: string | null
  position: [number, number, number]
  radius: [number, number, number]
  material: string
  function: string
}

export const classOf = (prompt: string): EntityClass => {
  const text = prompt.toLowerCase()
  if (/fuzil|arma|espada|pistola|rifle|fal/.test(text)) return 'weapon'
  if (/carro|nave|aviao|avião|moto|truck|drone/.test(text)) return 'vehicle'
  if (/urso|cavalo|passaro|pássaro|humano|cachorro|gato|ave/.test(text)) return 'creature'
  if (/ponte|casa|torre|muro|arco|edificio|edifício/.test(text)) return 'architecture'
  if (/mesa|cadeira|armario|armário|sofa|sofá|lanterna|abajur/.test(text)) return 'furniture'
  if (/barco|navio|canoa/.test(text)) return 'vessel'
  if (/chave|martelo|alicate|serra/.test(text)) return 'tool'
  if (/motor|gerador|radio|rádio|sensor/.test(text)) return 'machine'
  if (/capa|capacete|bota|luva/.test(text)) return 'apparel'
  return 'prop'
}

export const tokensOf = (prompt: string) =>
  prompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(token => token.length > 2)
