export type CollabRole = 'view' | 'comment' | 'edit' | 'admin'

export interface ShareRecord {
  projectId: string
  grantee: string
  role: CollabRole
}

export interface CommentRecord {
  id: string
  projectId: string
  author: string
  body: string
  artifactId?: string
}

const rank: Record<CollabRole, number> = { view: 1, comment: 2, edit: 3, admin: 4 }

export const can = (share: ShareRecord | undefined, need: CollabRole) =>
  Boolean(share && rank[share.role] >= rank[need])

export const applyShare = (shares: ShareRecord[], next: ShareRecord) => {
  const others = shares.filter(item => !(item.projectId === next.projectId && item.grantee === next.grantee))
  return [...others, next]
}

export const addComment = (comments: CommentRecord[], comment: CommentRecord, share: ShareRecord | undefined) => {
  if (!can(share, 'comment')) return { comments, accepted: false as const, reason: 'insufficient-role' as const }
  if (!comment.body.trim()) return { comments, accepted: false as const, reason: 'empty' as const }
  return { comments: [...comments, comment], accepted: true as const, reason: 'ok' as const }
}
