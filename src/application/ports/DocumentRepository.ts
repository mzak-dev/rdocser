/** Repository boundary for discovered documents. */
import type { Document } from "../../domain/documents/Document";
export interface DocumentRepository { findAll():Promise<Document[]>; findById(id:string):Promise<Document|undefined>; }
