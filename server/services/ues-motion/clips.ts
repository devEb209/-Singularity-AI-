export type ClipKind = 'idle' | 'walk' | 'run' | 'turn'

export interface MotionFeature {
  leftFoot: [number, number]
  rightFoot: [number, number]
  hipVel: [number, number]
  traj: [number, number][]
}

export interface MotionClip {
  id: string
  kind: ClipKind
  frames: MotionFeature[]
}

const series = (kind: ClipKind, speed: number, lift: number): MotionClip => ({
  id: kind,
  kind,
  frames: Array.from({ length: 8 }, (_, i) => {
    const phase = (i / 7) * Math.PI * 2
    return {
      leftFoot: [Math.sin(phase) * 0.12, Math.max(0, Math.sin(phase)) * lift],
      rightFoot: [Math.sin(phase + Math.PI) * 0.12, Math.max(0, Math.sin(phase + Math.PI)) * lift],
      hipVel: [speed, 0],
      traj: [[speed * 0.2, 0], [speed * 0.4, kind === 'turn' ? 0.3 : 0]],
    }
  }),
})

export const clipLibrary = (): MotionClip[] => [
  series('idle', 0, 0),
  series('walk', 1.2, 0.12),
  series('run', 3.1, 0.22),
  series('turn', 0.6, 0.08),
]

export const graph: Record<ClipKind, ClipKind[]> = {
  idle: ['idle', 'walk', 'turn'],
  walk: ['walk', 'idle', 'run', 'turn'],
  run: ['run', 'walk'],
  turn: ['turn', 'walk', 'idle'],
}
