import { deviceProfiles } from '../rrw/do15.js'
import type { DeviceClass, DeviceProfile } from '../rrw/types.js'

export interface ResourceSnapshot {
  cpuBusy: number
  memoryUsedMB: number
  tasks: number
  device: DeviceProfile
}

export const classifyDevice = (input: { cores: number; memoryMB: number; presentGpu: boolean; dedicated?: boolean }): DeviceClass => {
  if (input.dedicated && input.presentGpu) return 'dedicated'
  if (input.presentGpu && input.memoryMB >= 8192) return 'integrated'
  if (input.presentGpu) return 'igpu'
  if (input.memoryMB <= 1280 || input.cores <= 1) return 'ancient'
  if (input.memoryMB <= 4096) return 'mobile'
  return 'cpu'
}

export const snapshot = (input: { cores: number; memoryMB: number; presentGpu: boolean; dedicated?: boolean; cpuBusy?: number; memoryUsedMB?: number; tasks?: number }): ResourceSnapshot => {
  const device = deviceProfiles[classifyDevice(input)]
  return {
    cpuBusy: Math.max(0, Math.min(1, input.cpuBusy ?? 0.2)),
    memoryUsedMB: input.memoryUsedMB ?? Math.round(device.memoryMB * 0.35),
    tasks: input.tasks ?? 1,
    device,
  }
}

export const allowContinuum = (state: ResourceSnapshot) =>
  state.cpuBusy < 0.92 && state.memoryUsedMB < state.device.memoryMB * 0.9 && state.device.continuumSlots > 0

export const demandsDedicatedGpu = () => false
