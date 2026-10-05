/** Application use case for producing the runtime document manifest. */
import type { Document } from "../../domain/documents/Document";
export class BuildManifestUseCase { execute(documents:Document[]){return documents.map(d=>({id:d.slug,title:d.title,type:d.type,group:d.group,sourcePath:d.sourcePath}));} }
