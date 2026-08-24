import { describe, expect, it } from 'vitest'
import { UesStudioCore } from './core.js'
import { seedScene, worldPosition } from './graph.js'
import { StudioHistory } from './history.js'
import { sampleKeys } from './timeline.js'

describe('UES production studio backend', () => {
  it('parents world transforms, lerps the timeline and restores undo without a client engine', () => {
    const nodes = seedScene()
    expect(worldPosition(nodes, 'hand')).toEqual([2, 1.2, 0])
    expect(sampleKeys([{ t: 0, value: 1 }, { t: 1, value: 3 }], 0.5)).toBe(2)
    const history = new StudioHistory({ nodes, tracks: [] })
    history.apply({ kind: 'add', node: { id: 'prop', name: 'prop', parent: 'root', translation: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] } })
    expect(history.snapshot().nodes.some(node => node.id === 'prop')).toBe(true)
    expect(history.undo().nodes.some(node => node.id === 'prop')).toBe(false)
    expect(history.redo().nodes.some(node => node.id === 'prop')).toBe(true)
    const result = new UesStudioCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.aaaViewport).toBe(false)
    expect(result.verification.clientEngine).toBe(false)
  })
})
