import{createHmac}from'node:crypto';export const syncReceipt=(secret:string,payload:unknown)=>`snb-sync-hmac:${createHmac('sha256',secret).update(JSON.stringify(payload)).digest('hex')}`
