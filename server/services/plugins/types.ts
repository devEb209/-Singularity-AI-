export interface PluginManifest{id:string;name:string;version:string;capabilities:string[];permissions:string[];dependencies:{id:string;version:string}[];entrypoint:string;license:string;payloadChecksum:string}
export interface InstalledPlugin{manifest:PluginManifest;userId:string;projectId:string;status:'installed'|'enabled'|'disabled';installedAt:string;updatedAt:string;receipt:string}
export interface PluginState{plugins:InstalledPlugin[]}
