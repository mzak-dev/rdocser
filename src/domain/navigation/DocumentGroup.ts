/** A navigation group containing ordered documents. */
import type { Document } from "../documents/Document";
export class DocumentGroup { constructor(readonly name:string, readonly documents:Document[]){ documents.sort((a,b)=>a.order-b.order); } }
