export type V3 = [number, number, number]
export type CorpusKind = 'humanoid' | 'quadruped' | 'vehicle' | 'chair' | 'tree' | 'crate'

export interface CorpusPart {
  name: string
  parent: string | null
  position: V3
  radius: V3
  material: string
  function: string
}

export interface CorpusEntry {
  id: string
  kind: CorpusKind
  prompt: string
  parts: CorpusPart[]
}
