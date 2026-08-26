import { createHmac } from 'node:crypto'
export const pluginReceipt=(secret:string,payload:unknown)=>`snb-plugin-hmac:${createHmac('sha256',secret).update(JSON.stringify(payload)).digest('hex')}`
