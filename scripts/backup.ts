import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { config } from '../server/config.js'

const hashFile=async(path:string)=>createHash('sha256').update(await readFile(path)).digest('hex')
const walk=async(root:string,current=root):Promise<string[]>=>{const entries=await readdir(current,{withFileTypes:true}).catch(()=>[]);const files:string[]=[];for(const entry of entries){const path=join(current,entry.name);if(entry.isDirectory())files.push(...await walk(root,path));else files.push(path)}return files}
const action=process.argv[2]??'create',backupRoot=resolve('./backups')

if(action==='create'){
  await mkdir(backupRoot,{recursive:true});const stamp=new Date().toISOString().replace(/[:.]/g,'-'),directory=join(backupRoot,stamp);await mkdir(directory,{recursive:true})
  const source=resolve(config.DATABASE_PATH),destination=join(directory,'singularity.db'),db=new Database(source,{readonly:true});try{await db.backup(destination)}finally{db.close()}
  const uploads=resolve('./data/uploads');if((await stat(uploads).catch(()=>null))?.isDirectory())await cp(uploads,join(directory,'uploads'),{recursive:true})
  const files=await walk(directory),checksums:Record<string,string>={};for(const file of files)checksums[file.slice(directory.length+1)]=await hashFile(file)
  const manifest={format:'snb-backup-v1',createdAt:new Date().toISOString(),database:basename(destination),files:checksums};await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600})
  const backups=(await readdir(backupRoot,{withFileTypes:true})).filter(item=>item.isDirectory()).map(item=>item.name).sort().reverse();for(const old of backups.slice(10))await rm(join(backupRoot,old),{recursive:true,force:true})
  console.log(JSON.stringify({status:'created',directory,fileCount:Object.keys(checksums).length},null,2))
}else if(action==='verify'){
  const directory=resolve(process.argv[3]??'');const manifest=JSON.parse(await readFile(join(directory,'manifest.json'),'utf8')) as {format:string;files:Record<string,string>};if(manifest.format!=='snb-backup-v1')throw new Error('Unsupported backup format');const failures:string[]=[];for(const[file,expected]of Object.entries(manifest.files)){const actual=await hashFile(join(directory,file)).catch(()=>null);if(actual!==expected)failures.push(file)}console.log(JSON.stringify({status:failures.length?'invalid':'verified',files:Object.keys(manifest.files).length,failures},null,2));if(failures.length)process.exitCode=1
}else throw new Error('Use: backup.ts create | verify <directory>')
