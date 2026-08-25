import { createHmac } from 'node:crypto'
export const automationReceipt=(secret:string,payload:unknown)=>`snb-automation-hmac:${createHmac('sha256',secret).update(JSON.stringify(payload)).digest('hex')}`
