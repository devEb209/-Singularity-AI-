export const readFact=(facts:Record<string,unknown>,path:string)=>path.split('.').reduce<unknown>((value,key)=>value&&typeof value==='object'?(value as Record<string,unknown>)[key]:undefined,facts)
