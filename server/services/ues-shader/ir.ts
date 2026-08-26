import type { ShaderNode } from './graph.js'

export interface IrOp {
  id: string
  op: 'imm' | 'add' | 'mul' | 'noise' | 'sample' | 'pbr'
  args: string[]
  imm?: number
}

export const lowerGraph = (nodes: ShaderNode[]): IrOp[] =>
  nodes.map(node => {
    if (node.kind === 'const') return { id: node.id, op: 'imm', args: [], imm: node.value ?? 0 }
    if (node.kind === 'add' || node.kind === 'mul') return { id: node.id, op: node.kind, args: node.inputs }
    if (node.kind === 'noise' || node.kind === 'sample' || node.kind === 'pbr') return { id: node.id, op: node.kind, args: node.inputs }
    return { id: node.id, op: 'sample', args: node.inputs }
  })
