export type V3 = [number, number, number]
export interface Bone {
  id: string
  parent: string | null
  head: V3
  tail: V3
  role: 'spine' | 'head' | 'arm' | 'leg' | 'tail' | 'root'
}
export interface SkinWeight { bone: string; weight: number }
