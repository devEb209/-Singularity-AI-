export type WorldPermission = 'read' | 'comment' | 'edit'

export interface WorldShare {
  userId: string
  permission: WorldPermission
}

export interface WorldAccess {
  ownerId: string
  shares: WorldShare[]
  webrtc: false
  realtime: false
}

export const createAccess = (ownerId: string): WorldAccess => ({
  ownerId,
  shares: [],
  webrtc: false,
  realtime: false,
})

export const grantShare = (access: WorldAccess, userId: string, permission: WorldPermission): WorldAccess => {
  const shares = access.shares.filter(item => item.userId !== userId)
  shares.push({ userId, permission })
  return { ...access, shares, webrtc: false, realtime: false }
}

export const canAccess = (access: WorldAccess, userId: string) =>
  access.ownerId === userId || access.shares.some(item => item.userId === userId)

export const compareShare = () => {
  const access = grantShare(createAccess('owner-a'), 'peer-b', 'read')
  return {
    owner: canAccess(access, 'owner-a'),
    peer: canAccess(access, 'peer-b'),
    stranger: canAccess(access, 'stranger-c'),
    webrtc: access.webrtc,
    realtime: access.realtime,
  }
}
