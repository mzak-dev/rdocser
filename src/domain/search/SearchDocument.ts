/** Searchable projection of a document. */
export interface SearchDocument { id:string; title:string; slug:string; text:string; headings:string[]; group?:string; type:"article"|"presentation"; }
