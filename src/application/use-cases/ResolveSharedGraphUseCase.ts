/** Resolves a graph view encoded in a URL hash. */
import { ShareStateService } from "../services/ShareStateService";
export class ResolveSharedGraphUseCase { constructor(private readonly share:ShareStateService){} execute(hash:string){return this.share.decode(hash.replace(/^#/,""));} }
