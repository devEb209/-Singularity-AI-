export type MotionAdapterStatus = 'IMPLEMENTED' | 'ADAPTER_AVAILABLE' | 'EXTERNAL_DEPENDENCY' | 'PLANNED' | 'NOT_IMPLEMENTED'

export interface MotionAdapter {
  id: string
  name: string
  status: MotionAdapterStatus
  vision: false
  fetchedRemote: false
}

export const motionAdapters: MotionAdapter[] = [
  { id: 'structured-card', name: 'Structured motion cards', status: 'IMPLEMENTED', vision: false, fetchedRemote: false },
  { id: 'video-vision', name: 'Video / multimodal motion analysis', status: 'ADAPTER_AVAILABLE', vision: false, fetchedRemote: false },
  { id: 'mocap-database', name: 'Licensed MoCap clip database', status: 'ADAPTER_AVAILABLE', vision: false, fetchedRemote: false },
  { id: 'web-reference-search', name: 'Puter web-search reference harvest', status: 'ADAPTER_AVAILABLE', vision: false, fetchedRemote: false },
]

export const resolveMotionSource = (requested: string) => {
  const adapter = motionAdapters.find(item => item.id === requested) ?? motionAdapters[0]
  return {
    adapter: adapter.id,
    status: adapter.status,
    vision: false as const,
    fetchedRemote: false as const,
    executable: adapter.status === 'IMPLEMENTED',
    reason: adapter.status === 'IMPLEMENTED' ? 'structured-card' : 'ADAPTER_REQUIRED',
  }
}
