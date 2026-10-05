/** A ranked search result with optional heading anchor. */
export interface SearchResult { documentId:string; title:string; slug:string; heading?:string; score:number; }
