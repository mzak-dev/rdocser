/** Domain entity for a Markdown or MDX article. */
import { Document } from "./Document";
import type { DocumentRelation } from "../graph/DocumentRelation";
export class ArticleDocument extends Document { constructor(slug:string,title:string,group:string,order:number,sourcePath:string,relations:DocumentRelation[]=[]){super(slug,title,"article",group,order,sourcePath,relations);} }
