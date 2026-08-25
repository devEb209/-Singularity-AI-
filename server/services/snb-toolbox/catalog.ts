export type ToolboxLane = 'official' | 'original-lore' | 'community' | 'community-universe'

export interface ToolboxAsset {
  id: string
  lane: ToolboxLane
  name: string
  version: string
  author: string
  license: string
  tags: string[]
  dependencies: string[]
}

export const seedAssets = (): ToolboxAsset[] => [
  { id: 'snb-core-kit', lane: 'official', name: 'SNB Core Kit', version: '1.0.0', author: 'Bunker Studios', license: 'Apache-2.0', tags: ['official', 'kit'], dependencies: [] },
  { id: 'lore-main-01', lane: 'original-lore', name: 'Main Canon Seed', version: '1.0.0', author: 'Bunker Studios', license: 'CC-BY-4.0', tags: ['canon', 'main'], dependencies: ['snb-core-kit'] },
  { id: 'comm-bridge', lane: 'community', name: 'Stone Bridge Prefab', version: '0.9.0', author: 'community', license: 'CC0', tags: ['architecture', 'bridge'], dependencies: [] },
  { id: 'alt-ocean', lane: 'community-universe', name: 'Alternate Ocean Line', version: '0.3.0', author: 'community', license: 'CC-BY-4.0', tags: ['universe', 'alternate'], dependencies: ['lore-main-01'] },
]

export const blockedTag = (tag: string) => /odio|hate|doxx|malware|exploit/.test(tag.toLowerCase())
