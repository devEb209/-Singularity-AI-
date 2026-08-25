import { describe, expect, it } from 'vitest'
import { runChain } from './chain.js'

describe('RRW Genesis success chain', () => {
  it('executes the ten-step path without closing Genesis or copying a traditional engine', () => {
    const chain = runChain('oceano salgado sob céu nublado com fogo, floresta e um humano')
    expect(chain.executed).toBe(true)
    expect(chain.verification.valid).toBe(true)
    expect(chain.verification.genesisClosed).toBe(false)
    expect(chain.verification.completeReality).toBe(false)
    expect(chain.verification.traditionalPipeline).toBe(false)
    expect(chain.verification.webgpuRequired).toBe(false)
    expect(chain.verification.automaticPuter).toBe(false)
    expect(chain.steps).toHaveLength(10)
    expect(chain.steps.every(step => step.ok)).toBe(true)
    expect(chain.session.recomposed).toBe(false)
    expect(chain.seasons.shaderSeason).toBe(false)
    expect(chain.hydro.shaderWater).toBe(false)
  })
})
