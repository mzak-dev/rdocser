/** Abstracts filesystem access from application services. */
export interface FileSystem { read(path:string):Promise<string>; list(dir:string):Promise<string[]>; exists(path:string):Promise<boolean>; }
