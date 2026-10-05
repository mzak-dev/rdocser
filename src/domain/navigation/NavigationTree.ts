/** Immutable navigation tree assembled from document metadata. */
import type { Document } from "../documents/Document";
import { DocumentGroup } from "./DocumentGroup";
export class NavigationTree { readonly groups:DocumentGroup[]; constructor(documents:Document[]){const map=new Map<string,Document[]>(); for(const d of documents) map.set(d.group,[...(map.get(d.group)??[]),d]); this.groups=[...map].map(([name,items])=>new DocumentGroup(name,items)).sort((a,b)=>a.name.localeCompare(b.name));} all():Document[]{return this.groups.flatMap(g=>g.documents);} }
