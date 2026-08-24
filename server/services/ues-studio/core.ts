import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { applyTranslate, translateGizmo } from './gizmos.js'
import { parentsExist, seedScene, uniqueIds, worldPosition } from './graph.js'
import { StudioHistory } from './history.js'
import { inspectScene } from './inspector.js'
import { instantiatePrefab } from './prefab.js'
import { sampleTracks, seedTracks } from './timeline.js'
import { pickNode } from './viewport.js'

export class UesStudioCore {
  private thesis = new DThesisCore()

  process() {
    const history = new StudioHistory({ nodes: seedScene(), tracks: seedTracks() })
    const before = worldPosition(history.snapshot().nodes, 'hand')
    history.apply({ kind: 'move', id: 'hero', translation: [2, 0, 0] })
    const moved = worldPosition(history.snapshot().nodes, 'hand')
    history.apply({ kind: 'add', node: { id: 'crate', name: 'crate', parent: 'root', translation: [0, 0, 2], rotation: [0, 0, 0], scale: [1, 1, 1], mesh: 'crate' } })
    const sampled = sampleTracks(history.snapshot().tracks, 0.5)
    const undone = history.undo()
    const redone = history.redo()
    const inspector = inspectScene(redone.nodes, redone.tracks)
    const camera = { eye: [0, 1.2, 6] as [number, number, number], target: [2, 1.2, 0] as [number, number, number], fov: 0.9, aspect: 1 }
    const picked = pickNode(redone.nodes, camera, [0, 0])
    const gizmo = translateGizmo(redone.nodes, 'hero')
    const prefabbed = instantiatePrefab(applyTranslate(redone.nodes, 'lamp', [0, 0.2, 0]), [redone.nodes.find(item => item.id === 'crate')!], 'pf', 'root')
    const kernel = runKernel('Editor de produção remoto: grafo, inspector, timeline, undo, viewport, gizmo, prefab', 'ues.studio', ['scene-graph', 'timeline'], [
      { module: 'knowledge', accepted: true, note: 'authored scene, not a viewport engine' },
      { module: 'd-thesis', accepted: true, note: 'device remains a terminal' },
      { module: 'studio', accepted: uniqueIds(redone.nodes) && parentsExist(redone.nodes), note: 'graph integrity' },
      { module: 'represent', accepted: true, note: 'server-side scene only' },
      { module: 'd-o15', accepted: true, note: 'no client 3D engine' },
      { module: 'execute', accepted: moved[0] > before[0] + 0.9, note: 'parented world xform' },
      { module: 'verify', accepted: undone.nodes.every(node => node.id !== 'crate') && redone.nodes.some(node => node.id === 'crate'), note: 'undo/redo' },
      { module: 'refine', accepted: sampled['hero.tx'] === 2 && Boolean(picked) && prefabbed.some(item => item.id.startsWith('pf:')) && gizmo.axes.x.tip[0] > gizmo.axes.x.origin[0], note: 'viewport/gizmo/prefab' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Studio de produção com grafo/inspector/timeline reais no servidor',
      constraints: ['sem engine pesada no cliente', 'não reivindicar Unreal editor'],
      resources: ['scene graph', 'history', 'tracks'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-studio-v1',
      nodes: redone.nodes.length,
      tracks: redone.tracks.length,
      world: { handBefore: before, handAfterMove: moved },
      timeline: sampled,
      inspector: inspector.map(item => ({ id: item.id, fields: item.fields.length, animated: item.animated.length })),
      viewport: { picked: picked?.id ?? null, gizmo: gizmo.axes.x.tip, prefabs: prefabbed.filter(item => item.id.startsWith('pf:')).length },
      history: history.depth(),
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && uniqueIds(redone.nodes) && parentsExist(redone.nodes) && Math.abs(moved[0] - 3) < 1e-9 && sampled['hero.tx'] === 2,
        aaaViewport: false,
        clientEngine: false,
      },
      limitations: ['Server-side scene/timeline/inspector', 'Not an AAA viewport editor'],
    }
  }
}
