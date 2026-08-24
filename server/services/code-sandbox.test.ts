import { afterEach, describe, expect, it } from 'vitest'
import { rm } from 'node:fs/promises'
import { CodeValidationSandbox } from './code-sandbox.js'

const root='./data/test-sandboxes',sandbox=new CodeValidationSandbox(root)
afterEach(()=>rm(root,{recursive:true,force:true}))

describe('Code Validation Sandbox',()=>{
  it('syntax-checks JavaScript without executing it',async()=>{const result=await sandbox.validate('test-user','javascript','const answer = 42; console.log(answer)');expect(result.valid).toBe(true);expect(result.executedUserCode).toBe(false);expect(result.networkAllowed).toBe(false)})
  it('returns compiler diagnostics for invalid code',async()=>{const result=await sandbox.validate('test-user','javascript','const = broken');expect(result.valid).toBe(false);expect(result.stderr.length).toBeGreaterThan(0)})
  it('type-checks valid TypeScript without executing it',async()=>{const result=await sandbox.validate('test-user','typescript','const value: number = 42');expect(result.valid).toBe(true);expect(result.executedUserCode).toBe(false)})
  it('type-checks TypeScript and detects risky capabilities statically',async()=>{const result=await sandbox.validate('test-user','typescript',"const value: number = 'wrong'; fetch('https://example.com')");expect(result.valid).toBe(false);expect(result.findings.some(item=>item.id==='network-call')).toBe(true)})
  it('parses JSON deterministically',async()=>{expect((await sandbox.validate('test-user','json','{"ready":true}')).valid).toBe(true);expect((await sandbox.validate('test-user','json','{"ready":}')).valid).toBe(false)})
})
