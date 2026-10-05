/** Composes application services for the browser runtime. */
import { SearchIndexService } from "../../application/services/SearchIndexService"; import { ShareStateService } from "../../application/services/ShareStateService";
export class RuntimeContainer { readonly search=new SearchIndexService(); readonly share=new ShareStateService(); }
