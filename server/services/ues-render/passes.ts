export const renderPasses = [
  'depth',
  'shadow',
  'opaque',
  'masked',
  'transparent',
  'water',
  'particles',
  'post',
  'ui',
] as const

export type RenderPassId = typeof renderPasses[number]

export interface RenderPassNode {
  id: RenderPassId
  reads: string[]
  writes: string[]
  dependsOn: RenderPassId[]
}

export const defaultPasses = (): RenderPassNode[] => [
  { id: 'depth', reads: ['scene'], writes: ['depth'], dependsOn: [] },
  { id: 'shadow', reads: ['scene'], writes: ['shadow'], dependsOn: [] },
  { id: 'opaque', reads: ['depth', 'shadow', 'scene'], writes: ['color'], dependsOn: ['depth', 'shadow'] },
  { id: 'masked', reads: ['depth', 'color'], writes: ['color'], dependsOn: ['opaque'] },
  { id: 'transparent', reads: ['color', 'depth'], writes: ['color'], dependsOn: ['masked'] },
  { id: 'water', reads: ['color', 'depth'], writes: ['color'], dependsOn: ['transparent'] },
  { id: 'particles', reads: ['color'], writes: ['color'], dependsOn: ['water'] },
  { id: 'post', reads: ['color'], writes: ['ldr'], dependsOn: ['particles'] },
  { id: 'ui', reads: ['ldr'], writes: ['swapchain'], dependsOn: ['post'] },
]
