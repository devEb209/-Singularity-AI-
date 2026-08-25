export const emitPbrWgsl = () => `fn ues_ggx_d(n_dot_h: f32, roughness: f32) -> f32 {
  let a = max(0.045, roughness * roughness);
  let a2 = a * a;
  let d = n_dot_h * n_dot_h * (a2 - 1.0) + 1.0;
  return a2 / (3.14159265 * d * d);
}

fn ues_smith_g(n_dot_v: f32, n_dot_l: f32, roughness: f32) -> f32 {
  let k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  let g_v = n_dot_v / (n_dot_v * (1.0 - k) + k);
  let g_l = n_dot_l / (n_dot_l * (1.0 - k) + k);
  return g_v * g_l;
}

fn ues_schlick(f0: vec3f, v_dot_h: f32) -> vec3f {
  return f0 + (vec3f(1.0) - f0) * pow(1.0 - v_dot_h, 5.0);
}

fn ues_cook_torrance(albedo: vec3f, roughness: f32, metalness: f32, n: vec3f, v: vec3f, l: vec3f, light: vec3f) -> vec3f {
  let n_dot_l = max(dot(n, l), 0.0);
  let n_dot_v = max(dot(n, v), 0.0);
  if (n_dot_l <= 0.0 || n_dot_v <= 0.0) { return vec3f(0.0); }
  let h = normalize(v + l);
  let n_dot_h = max(dot(n, h), 0.0);
  let v_dot_h = max(dot(v, h), 0.0);
  let f0 = mix(vec3f(0.04), albedo, metalness);
  let f = ues_schlick(f0, v_dot_h);
  let d = ues_ggx_d(n_dot_h, roughness);
  let g = ues_smith_g(n_dot_v, n_dot_l, roughness);
  let spec = f * d * g / max(4.0 * n_dot_l * n_dot_v, 1e-4);
  let kd = (vec3f(1.0) - f) * (1.0 - metalness);
  return (kd * albedo / 3.14159265 + spec) * n_dot_l * light;
}
`

export const emitPbrGlsl = () =>
  emitPbrWgsl()
    .replaceAll('fn ', 'vec3 ')
    .replaceAll('vec3f', 'vec3')
    .replaceAll('f32', 'float')
    .replaceAll('vec3 ', (match, offset, source) => source.slice(offset, offset + 40).includes('-> f32') ? 'float ' : match)
