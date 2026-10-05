/** Node filesystem adapter used by the CLI. */
import { promises as fs } from "node:fs";
export class NodeFileSystem { read(path:string){return fs.readFile(path,"utf8");} async list(dir:string){return (await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?`${e.name}/`:e.name);} exists(path:string){return fs.access(path).then(()=>true).catch(()=>false);} }
