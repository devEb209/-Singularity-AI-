import { describe, expect, it } from 'vitest'
import { SnbCollabCore } from './core.js'
import { addComment, applyShare, can } from './policy.js'

describe('SNB collaboration ACL', () => {
  it('allows comments for comment role and rejects strangers', () => {
    const share = applyShare([], { projectId: 'p', grantee: 'ada', role: 'comment' })[0]
    expect(can(share, 'comment')).toBe(true)
    expect(can(share, 'edit')).toBe(false)
    expect(addComment([], { id: '1', projectId: 'p', author: 'ada', body: 'ok' }, share).accepted).toBe(true)
    expect(addComment([], { id: '2', projectId: 'p', author: 'eve', body: 'no' }, undefined).accepted).toBe(false)
    const result = new SnbCollabCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.livePresence).toBe(false)
  })
})
