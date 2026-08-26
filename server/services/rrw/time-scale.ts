import type { RealityClock } from './orbit.js'
import type { RealityDescription } from './types.js'

export const descriptionForSpan = (clock: Pick<RealityClock, 'hour'> & { span?: 'hour' | 'day' | 'season' | 'year' }): RealityDescription => {
  if (clock.span === 'year') return 'statistical'
  if (clock.span === 'season') return 'continuum'
  if (clock.span === 'day') return 'discrete-body'
  return 'interactive-local'
}

export const compareTimeScale = () => {
  const hour = descriptionForSpan({ hour: 12, span: 'hour' })
  const day = descriptionForSpan({ hour: 12, span: 'day' })
  const season = descriptionForSpan({ hour: 12, span: 'season' })
  const year = descriptionForSpan({ hour: 12, span: 'year' })
  return {
    hour,
    day,
    season,
    year,
    notLod: hour !== year && day !== year,
    lodPreset: false as const,
  }
}
