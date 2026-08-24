import type { ReferenceCard } from './types.js'

export const sampleCards = (prompt: string): ReferenceCard[] => {
  const human = /humano|personagem|character|hero/i.test(prompt)
  return [
    {
      id: 'prop-01',
      title: 'Humanoid canon',
      kind: 'proportion',
      license: 'CC0',
      source: 'internal-canon',
      values: { headToBody: human ? 7.5 : 5.5, armSpan: 1, torso: 2.5 },
    },
    {
      id: 'pal-01',
      title: 'Earth palette',
      kind: 'palette',
      license: 'Apache-2.0',
      source: 'internal-swatch',
      values: { hex: ['#c4a574', '#3d4a3a', '#1f1a16'] },
    },
    {
      id: 'sil-01',
      title: 'Standing silhouette',
      kind: 'silhouette',
      license: 'CC0',
      source: 'internal-bbox',
      values: { aspect: human ? 0.42 : 0.7, limbs: 4 },
    },
    {
      id: 'lic-ok',
      title: 'Production license',
      kind: 'license',
      license: 'Apache-2.0',
      source: 'NOTICE',
      values: { attribution: 'Bunker Studios' },
    },
  ]
}

export const restrictedCard = (): ReferenceCard => ({
  id: 'lic-bad',
  title: 'Unknown scan',
  kind: 'license',
  license: 'unknown',
  source: 'unverified-upload',
  values: { attribution: '' },
})
