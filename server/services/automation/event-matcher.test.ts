import { describe,expect,it } from 'vitest'
import { matchEvent } from './event-matcher.js'
describe('event matcher',()=>it('requires event and all exact filters',()=>{expect(matchEvent('artifact.verified',{type:'document.pdf'},'artifact.verified',{type:'document.pdf'})).toBe(true);expect(matchEvent('artifact.verified',{type:'document.pdf'},'artifact.failed',{type:'document.pdf'})).toBe(false)}))
