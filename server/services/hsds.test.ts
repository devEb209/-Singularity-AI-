import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../app.js'

let app:FastifyInstance|undefined
afterEach(async()=>{await app?.close();app=undefined})

describe('HSDS verified local streaming baseline',()=>{
 it('runs artifact visual state through capture, SSE playback, input, and feedback',async()=>{
  app=await buildApp({NODE_ENV:'test'})
  const auth=await app.inject({method:'POST',url:'/api/v1/auth/guest'}),headers={authorization:`Bearer ${auth.json().token as string}`}
  const created=await app.inject({method:'POST',url:'/api/v1/divine-engine/projects',headers,payload:{name:'Forest stream',brief:'Interactive biologically grounded forest visual state',target:'web',executionPolicy:'remote-first',deviceProfile:{tier:'low'}}})
  expect(created.statusCode).toBe(201)
  const divineProjectId=created.json().divine.id as string
  const opened=await app.inject({method:'POST',url:'/api/v1/hsds/sessions',headers,payload:{divineProjectId,device:{viewportWidth:512,viewportHeight:512,bandwidthMbps:1.2,latencyMs:180,decodeTier:'low',saveData:true}}})
  expect(opened.statusCode).toBe(201)
  expect(opened.json().session.profile).toMatchObject({width:256,height:256,codec:'svg-sequence',transport:'sse'})
  expect(opened.json().capabilities.truthBoundary).toContain('does not claim GPU')
  const sessionId=opened.json().session.id as string
  const first=await app.inject({method:'GET',url:`/api/v1/hsds/sessions/${sessionId}/stream`,headers})
  expect(first.statusCode).toBe(200);expect(first.headers['content-type']).toContain('text/event-stream');expect(first.body).toContain('event: frame');expect(first.body).toContain('image/svg+xml');expect(first.body).toContain('verified')
  const input=await app.inject({method:'POST',url:`/api/v1/hsds/sessions/${sessionId}/input`,headers,payload:{type:'keyboard',key:'ArrowRight'}})
  expect(input.statusCode).toBe(200);expect(input.json().accepted).toBe(true);expect(input.json().feedbackFrame.inputAcknowledged).toBe('keyboard')
  const closed=await app.inject({method:'POST',url:`/api/v1/hsds/sessions/${sessionId}/close`,headers})
  expect(closed.json().status).toBe('closed')
  const blocked=await app.inject({method:'GET',url:`/api/v1/hsds/sessions/${sessionId}/stream`,headers})
  expect(blocked.statusCode).toBe(409)
 })
})
