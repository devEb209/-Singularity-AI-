export interface MotionKey {
  t: number
  joints: Record<string, number>
}

export interface MotionCard {
  id: string
  title: string
  subject: 'human' | 'weapon' | 'vehicle' | 'animal'
  license: 'CC0' | 'Apache-2.0'
  source: 'structured-not-video'
  keys: MotionKey[]
}

export const reloadFal: MotionCard = {
  id: 'reload-fn-fal',
  title: 'FN FAL reload (structured)',
  subject: 'weapon',
  license: 'CC0',
  source: 'structured-not-video',
  keys: [
    { t: 0, joints: { spine: 0, 'l-upper-arm': 0.2, 'r-upper-arm': 0.15, 'l-lower-arm': 0.1 } },
    { t: 0.28, joints: { spine: 0.05, 'l-upper-arm': 0.7, 'r-upper-arm': 0.35, 'l-lower-arm': 0.55 } },
    { t: 0.62, joints: { spine: 0.04, 'l-upper-arm': 0.85, 'r-upper-arm': 0.4, 'l-lower-arm': 0.8 } },
    { t: 1, joints: { spine: 0, 'l-upper-arm': 0.22, 'r-upper-arm': 0.16, 'l-lower-arm': 0.12 } },
  ],
}
