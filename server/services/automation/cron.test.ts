import { describe,expect,it } from 'vitest'
import { nextCron,parseCron } from './cron.js'
describe('cron',()=>{it('parses bounded five-field expressions and computes UTC occurrence',()=>{expect(parseCron('*/15 9 * * 1').map(x=>x.length)).toEqual([4,1,31,12,1]);expect(nextCron('*/15 9 * * 1',new Date('2026-08-24T08:59:00Z')).toISOString()).toBe('2026-08-24T09:00:00.000Z')});it('rejects malformed schedules',()=>expect(()=>parseCron('* * *')).toThrow(/cinco/))})
