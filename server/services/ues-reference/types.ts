export type ReferenceKind = 'proportion' | 'palette' | 'silhouette' | 'license'
export type ReferenceLicense = 'CC0' | 'Apache-2.0' | 'unknown' | 'all-rights-reserved'

export interface ReferenceCard {
  id: string
  title: string
  kind: ReferenceKind
  license: ReferenceLicense
  source: string
  values: Record<string, number | string | Array<number | string>>
}

export interface ExtractedConstraint {
  id: string
  kind: ReferenceKind
  rule: string
  value: number | string | Array<number | string>
  sourceCard: string
}

export interface RightsVerdict {
  allowed: boolean
  blocked: string[]
  reasons: string[]
  vision: false
}
