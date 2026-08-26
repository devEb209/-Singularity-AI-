import type { MotionCard } from '../ues-umotion/cards.js'

const card = (id: string, title: string, subject: MotionCard['subject'], keys: MotionCard['keys']): MotionCard => ({
  id, title, subject, license: 'CC0', source: 'structured-not-video', keys,
})

export const compileMotionPrompt = (prompt: string): MotionCard => {
  const text = prompt.toLowerCase()
  if (/recarga|reload|fal/.test(text)) {
    return card('compile-reload', 'Reload from mechanics', 'weapon', [
      { t: 0, joints: { spine: 0, 'l-upper-arm': 0.2, 'r-upper-arm': 0.15, mag: 0, bolt: 0 } },
      { t: 0.3, joints: { spine: 0.05, 'l-upper-arm': 0.72, 'r-upper-arm': 0.34, mag: 0.75, bolt: 0.1 } },
      { t: 0.65, joints: { spine: 0.04, 'l-upper-arm': 0.8, 'r-upper-arm': 0.4, mag: 0.1, bolt: 0.82 } },
      { t: 1, joints: { spine: 0, 'l-upper-arm': 0.22, 'r-upper-arm': 0.16, mag: 0, bolt: 0 } },
    ])
  }
  if (/andar|andand|walk|caminh/.test(text)) {
    return card('compile-walk', 'Walk cycle from gait', 'human', [
      { t: 0, joints: { 'l-upper-leg': 0.2, 'r-upper-leg': -0.12, spine: 0.02 } },
      { t: 0.5, joints: { 'l-upper-leg': -0.12, 'r-upper-leg': 0.2, spine: -0.02 } },
      { t: 1, joints: { 'l-upper-leg': 0.2, 'r-upper-leg': -0.12, spine: 0.02 } },
    ])
  }
  if (/sent|sit/.test(text)) {
    return card('compile-sit', 'Sit from hip flexion', 'human', [
      { t: 0, joints: { spine: 0, 'l-upper-leg': 0, 'r-upper-leg': 0 } },
      { t: 1, joints: { spine: 0.18, 'l-upper-leg': 0.85, 'r-upper-leg': 0.85 } },
    ])
  }
  if (/abrir|open/.test(text)) {
    return card('compile-open', 'Open from reach', 'human', [
      { t: 0, joints: { 'r-upper-arm': 0.1, 'r-lower-arm': 0.1 } },
      { t: 1, joints: { 'r-upper-arm': 0.7, 'r-lower-arm': 0.45 } },
    ])
  }
  if (/arremess|throw/.test(text)) {
    return card('compile-throw', 'Throw from kinetic chain', 'human', [
      { t: 0, joints: { spine: -0.1, 'r-upper-arm': -0.2 } },
      { t: 0.55, joints: { spine: 0.15, 'r-upper-arm': 0.9 } },
      { t: 1, joints: { spine: 0.05, 'r-upper-arm': 0.35 } },
    ])
  }
  return card('compile-idle', 'Idle from residual tone', 'human', [
    { t: 0, joints: { spine: 0 } },
    { t: 0.5, joints: { spine: 0.03 } },
    { t: 1, joints: { spine: 0 } },
  ])
}
