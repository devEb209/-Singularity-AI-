import { describe, expect, it } from 'vitest'
import { compareDayNight } from '../rrw/circadian.js'
import { bindAudio } from '../rrw/audio-bind.js'
import { iterateBrokenOcean } from '../rrw/iterate.js'
import { resumeWorld } from '../rrw/resume.js'
import { RrwGenesisCore } from './core.js'

describe('RRW Genesis path', () => {
  it('cools night, resumes from held state, settles phase refine and binds acoustics', () => {
    expect(compareDayNight().nightColder).toBe(true)
    expect(compareDayNight().starDimmerAtNight).toBe(true)
    expect(resumeWorld().resumed).toBe(true)
    expect(iterateBrokenOcean().settled).toBe(true)
    expect(bindAudio().shaderAudio).toBe(false)
    expect(bindAudio().waterFaster).toBe(true)
  })

  it('runs the RRW Genesis path without closing the generation', () => {
    const result = new RrwGenesisCore().process('oceano salgado com fogo e um humano')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.genesisClosed).toBe(false)
    expect(result.verification.webgpuRequired).toBe(false)
    expect(result.circadian.shaderDayNight).toBe(false)
    expect(result.resume.recomposed).toBe(false)
    expect(result.nav.recast).toBe(false)
  })
})
