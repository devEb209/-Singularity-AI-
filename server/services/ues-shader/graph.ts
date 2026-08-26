export type ShaderNodeKind = 'const' | 'add' | 'mul' | 'noise' | 'sample' | 'pbr' | 'water' | 'terrain'

export interface ShaderNode {
  id: string
  kind: ShaderNodeKind
  value?: number
  inputs: string[]
}

export const defaultGraph = (): ShaderNode[] => [
  { id: 'two', kind: 'const', value: 2, inputs: [] },
  { id: 'three', kind: 'const', value: 3, inputs: [] },
  { id: 'six', kind: 'mul', inputs: ['two', 'three'] },
  { id: 'unused', kind: 'const', value: 99, inputs: [] },
  { id: 'rough', kind: 'const', value: 0.4, inputs: [] },
  { id: 'albedo', kind: 'sample', inputs: [] },
  { id: 'surf', kind: 'pbr', inputs: ['albedo', 'rough', 'six'] },
]
