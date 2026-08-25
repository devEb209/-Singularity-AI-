import type { Portal, V2 } from './types.js'

const area = (a: V2, b: V2, c: V2) => (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1])
const same = (a: V2, b: V2) => Math.abs(a[0] - b[0]) < 1e-8 && Math.abs(a[1] - b[1]) < 1e-8

export const portalsFromPath = (path: [number, number][]): Portal[] => {
  const portals: Portal[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const [x0, z0] = path[i]
    const [x1, z1] = path[i + 1]
    const dx = x1 - x0
    const dz = z1 - z0
    const left: V2 = [x0 + dx / 2 - dz * 0.5, z0 + dz / 2 + dx * 0.5]
    const right: V2 = [x0 + dx / 2 + dz * 0.5, z0 + dz / 2 - dx * 0.5]
    portals.push({ left, right })
  }
  return portals
}

export const funnel = (start: V2, portals: Portal[], goal: V2): V2[] => {
  const path: V2[] = [start]
  let apex = start
  let left = start
  let right = start
  let leftIndex = 0
  let rightIndex = 0
  const sequence = [...portals, { left: goal, right: goal }]
  for (let i = 0; i < sequence.length; i++) {
    const nextLeft = sequence[i].left
    const nextRight = sequence[i].right
    if (area(apex, right, nextRight) <= 0) {
      if (same(apex, right) || area(apex, left, nextRight) > 0) {
        right = nextRight
        rightIndex = i
      } else {
        path.push(left)
        apex = left
        i = leftIndex
        left = apex
        right = apex
        leftIndex = i
        rightIndex = i
        continue
      }
    }
    if (area(apex, left, nextLeft) >= 0) {
      if (same(apex, left) || area(apex, right, nextLeft) < 0) {
        left = nextLeft
        leftIndex = i
      } else {
        path.push(right)
        apex = right
        i = rightIndex
        leftIndex = i
        rightIndex = i
      }
    }
  }
  path.push(goal)
  return path
}

export const polylineLength = (points: V2[]) => points.reduce((sum, point, index) => index === 0 ? 0 : sum + Math.hypot(point[0] - points[index - 1][0], point[1] - points[index - 1][1]), 0)
