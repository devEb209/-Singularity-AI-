import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { addComment, applyShare, can } from './policy.js'

export class SnbCollabCore {
  private thesis = new DThesisCore()

  process() {
    const shares = applyShare([], { projectId: 'proj', grantee: 'ada', role: 'comment' })
    const allowed = addComment([], { id: 'c1', projectId: 'proj', author: 'ada', body: 'revisar o oceano' }, shares[0])
    const denied = addComment([], { id: 'c2', projectId: 'proj', author: 'eve', body: 'spam' }, undefined)
    const kernel = runKernel('Colaboração nativa: share + papel + comentário', 'snb.collab', ['auth'], [
      { module: 'knowledge', accepted: true, note: 'roles' },
      { module: 'd-thesis', accepted: true, note: 'least privilege' },
      { module: 'collab', accepted: allowed.accepted && !denied.accepted, note: 'acl' },
      { module: 'represent', accepted: true, note: 'artifact comments' },
      { module: 'd-o15', accepted: true, note: 'not a full social network' },
      { module: 'execute', accepted: can(shares[0], 'comment') && !can(shares[0], 'admin'), note: 'rank' },
      { module: 'verify', accepted: allowed.comments.length === 1, note: 'persisted in graph' },
      { module: 'refine', accepted: true, note: 'not live multiplayer editing' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Colaboração com permissão real; não é rede social tóxica',
      constraints: ['ACL', 'sem fingir merge git'],
      resources: ['shares', 'comments'],
      priorities: { quality: 8, performance: 6, safety: 9, cost: 3, scalability: 7 },
    })
    return {
      format: 'snb-collab-v1',
      shares: shares.length,
      comments: allowed.comments.length,
      denied: denied.reason,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && allowed.accepted && !denied.accepted, livePresence: false },
      limitations: ['Share/comment ACL foundation, not realtime co-editing'],
    }
  }
}
