export interface Texture2D {
  width: number
  height: number
  pixels: Float32Array
}

export type WrapMode = 'repeat' | 'clamp'
