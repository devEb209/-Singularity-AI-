import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { AppError } from '../lib/errors.js'

const execute=promisify(execFile)
export type SandboxLanguage='javascript'|'typescript'|'json'

export class CodeValidationSandbox{
  private root:string
  constructor(root='./data/sandboxes'){this.root=resolve(root)}
  async validate(userId:string,language:SandboxLanguage,source:string){if(Buffer.byteLength(source)>500_000)throw new AppError('Código excede 500 KB.',413,'SANDBOX_INPUT_TOO_LARGE');const safeUser=userId.replace(/[^a-zA-Z0-9_-]/g,'_');await mkdir(join(this.root,safeUser),{recursive:true});const directory=await mkdtemp(join(this.root,safeUser,'validation-'));const extension=language==='javascript'?'js':language==='typescript'?'ts':'json',file=join(directory,`main.${extension}`),started=performance.now();await writeFile(file,source,{mode:0o600});const findings=this.scan(source)
    try{if(language==='json'){JSON.parse(source);return{valid:true,language,stage:'parse',durationMs:Math.round(performance.now()-started),findings,stdout:'',stderr:'',executedUserCode:false,networkAllowed:false}}
      const command=language==='javascript'?process.execPath:process.execPath,args=language==='javascript'?['--check',file]:[resolve('./node_modules/typescript/bin/tsc'),'--ignoreConfig','--noEmit','--strict','--skipLibCheck','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext',file]
      const result=await execute(command,args,{cwd:directory,timeout:10_000,maxBuffer:256_000,env:{PATH:process.env.PATH??'',HOME:directory,TMPDIR:directory,NO_COLOR:'1'}})
      return{valid:true,language,stage:language==='javascript'?'syntax':'typecheck',durationMs:Math.round(performance.now()-started),findings,stdout:result.stdout,stderr:result.stderr,executedUserCode:false,networkAllowed:false}
    }catch(error){const failure=error as Error&{stdout?:string;stderr?:string;code?:number|string;killed?:boolean};return{valid:false,language,stage:language==='json'?'parse':language==='javascript'?'syntax':'typecheck',durationMs:Math.round(performance.now()-started),findings,stdout:String(failure.stdout??'').slice(0,256000),stderr:String(failure.stderr??failure.message).slice(0,256000),exitCode:failure.code,killed:Boolean(failure.killed),executedUserCode:false,networkAllowed:false}}
    finally{await rm(directory,{recursive:true,force:true})}}
  policy(){return{mode:'validation-only',arbitraryExecution:false,network:false,commands:['node --check','typescript tsc --noEmit','JSON.parse'],limits:{inputBytes:500000,timeoutMs:10000,maxOutputBytes:256000},note:'O Beta compila/valida, mas não executa código não confiável porque o ambiente atual não oferece isolamento de rede/cgroup suficiente.'}}
  private scan(source:string){const rules:[RegExp,string,string][]=[[/\b(child_process|cluster|worker_threads)\b/,'process-spawn','high'],[/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/,'network-call','medium'],[/\b(eval|Function)\s*\(/,'dynamic-code','high'],[/\b(rmSync|unlinkSync|rmdirSync)\b/,'destructive-filesystem','high'],[/\b(process\.env|import\.meta\.env)\b/,'secret-access','medium']];return rules.filter(([pattern])=>pattern.test(source)).map(([,id,severity])=>({id,severity}))}
}
