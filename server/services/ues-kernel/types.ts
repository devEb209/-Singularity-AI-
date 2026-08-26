export const kernelStages = [
  'knowledge',
  'thesis',
  'module',
  'represent',
  'do15',
  'execute',
  'verify',
  'refine',
] as const

export type KernelStage = typeof kernelStages[number]

export interface KernelTrace {
  stage: KernelStage
  module: string
  accepted: boolean
  note: string
}
