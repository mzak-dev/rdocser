/** Builds and queries the document navigation tree. */
import type { Document } from "../../domain/documents/Document"; import { NavigationTree } from "../../domain/navigation/NavigationTree";
export class DocumentCatalogService { private tree?:NavigationTree; constructor(private readonly loader:()=>Promise<Document[]>){ } async scan(){this.tree=new NavigationTree(await this.loader()); return this.tree;} getById(id:string){return this.tree?.all().find(d=>d.id.value===id);} }
