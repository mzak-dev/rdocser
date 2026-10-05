/** Base domain entity shared by articles and presentations. */
import type { DocumentType } from "./DocumentType";
import type { DocumentRelation } from "../graph/DocumentRelation";
import { DocumentId } from "./DocumentId";
export abstract class Document { readonly id: DocumentId; constructor(readonly slug:string, readonly title:string, readonly type:DocumentType, readonly group:string, readonly order:number, readonly sourcePath:string, readonly relations:DocumentRelation[] = []) { this.id = new DocumentId(slug); } }
