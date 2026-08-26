export interface Joint {
  id: string
  length: number
  angle: number
  min: number
  max: number
}

export type Vec2 = [number, number]

export const defaultArm = (): Joint[] => [
  { id: 'shoulder', length: 0.32, angle: 0.4, min: -1.2, max: 1.6 },
  { id: 'elbow', length: 0.28, angle: 0.7, min: 0.05, max: 2.4 },
  { id: 'wrist', length: 0.16, angle: -0.2, min: -1.1, max: 1.1 },
]

export const clampJoint = (joint: Joint) => ({
  ...joint,
  angle: Math.max(joint.min, Math.min(joint.max, joint.angle)),
})

export const forward = (joints: Joint[], origin: Vec2 = [0, 0]) => {
  const points: Vec2[] = [origin]
  let angle = 0
  let x = origin[0]
  let y = origin[1]
  for (const joint of joints) {
    angle += joint.angle
    x += Math.cos(angle) * joint.length
    y += Math.sin(angle) * joint.length
    points.push([x, y])
  }
  return points
}

export const reach = (joints: Joint[]) => joints.reduce((sum, item) => sum + item.length, 0)
