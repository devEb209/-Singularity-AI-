export interface Sphere {
  id: string
  center: [number, number, number]
  radius: number
}

export interface Plane {
  n: [number, number, number]
  d: number
}

const dot = (a: [number, number, number], b: [number, number, number]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const sphereInFrustum = (sphere: Sphere, planes: Plane[]) =>
  planes.every(plane => dot(plane.n, sphere.center) + plane.d >= -sphere.radius)

export const cullSpheres = (spheres: Sphere[], planes: Plane[]) =>
  spheres.map(sphere => ({ id: sphere.id, visible: sphereInFrustum(sphere, planes) }))

export const gerstnerField = (size: number, time: number, amplitude = 0.08, wave = 0.9, omega = 1.4) => {
  const field: number[] = []
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      field.push(amplitude * Math.sin(wave * x + wave * 0.35 * z - omega * time))
    }
  }
  return field
}

export const evaluatePbr = (albedo: [number, number, number], roughness: number, metalness: number, nDotL: number) => {
  const light = Math.max(0, nDotL)
  const spec = (1 - roughness) * (0.04 * (1 - metalness) + metalness) * light
  return albedo.map(channel => channel * (1 - metalness) * light + spec) as [number, number, number]
}

export const expandIndirect = (visible: boolean[], instanceCount: number[]) =>
  visible.reduce((sum, item, index) => sum + (item ? instanceCount[index] ?? 1 : 0), 0)
