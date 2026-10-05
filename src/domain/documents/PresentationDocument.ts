/** Domain entity for a Reveal.js presentation. */
import { Document } from "./Document";
import type { DocumentRelation } from "../graph/DocumentRelation";
export class PresentationDocument extends Document { constructor(slug:string,title:string,group:string,order:number,sourcePath:string,relations:DocumentRelation[]=[]){super(slug,title,"presentation",group,order,sourcePath,relations);} }
