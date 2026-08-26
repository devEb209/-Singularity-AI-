import type { ConstructionClock, LayerId } from './types.js'

export const startClock = (layerFocus: LayerId = 0): ConstructionClock => ({
  tick: 0,
  speed: 1,
  paused: false,
  layerFocus,
})

export const pauseClock = (clock: ConstructionClock): ConstructionClock => ({ ...clock, paused: true })

export const resumeClock = (clock: ConstructionClock): ConstructionClock => ({ ...clock, paused: false })

export const setSpeed = (clock: ConstructionClock, speed: number): ConstructionClock => ({
  ...clock,
  speed: Math.max(0.25, Math.min(8, speed)),
})

export const stepClock = (clock: ConstructionClock): ConstructionClock => {
  if (clock.paused) return clock
  const nextFocus = Math.min(29, clock.layerFocus + (clock.tick % 2 === 1 ? 1 : 0)) as LayerId
  return {
    ...clock,
    tick: clock.tick + clock.speed,
    layerFocus: nextFocus,
  }
}

export const rewindClock = (clock: ConstructionClock): ConstructionClock => ({
  ...clock,
  tick: Math.max(0, clock.tick - clock.speed),
  layerFocus: Math.max(0, clock.layerFocus - 1) as LayerId,
})

export const compareReplay = () => {
  const started = startClock(0)
  const faster = setSpeed(started, 2)
  const moved = stepClock(stepClock(faster))
  const paused = pauseClock(moved)
  const frozen = stepClock(paused)
  const back = rewindClock(resumeClock(paused))
  return {
    pausedHolds: frozen.tick === paused.tick,
    sped: moved.tick > started.tick,
    rewinded: back.tick < moved.tick,
    aaaTimeline: false as const,
  }
}
