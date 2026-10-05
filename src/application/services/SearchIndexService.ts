/** Ranks token matches across title, group, headings and document text. */
import type { SearchDocument } from "../../domain/search/SearchDocument";
import type { SearchResult } from "../../domain/search/SearchResult";
export class SearchIndexService {
  private docs: SearchDocument[] = [];
  build(docs: SearchDocument[]) { this.docs = docs; }
  search(query: string): SearchResult[] {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
    if (!terms.length) return [];
    return this.docs.map(doc => {
      const title = doc.title.toLocaleLowerCase();
      const headings = doc.headings.join(" ").toLocaleLowerCase();
      const group = (doc.group ?? "").toLocaleLowerCase();
      const text = doc.text.toLocaleLowerCase();
      let score = 0;
      for (const term of terms) {
        const rank = (title.includes(term) ? 8 : 0) + (group.includes(term) ? 4 : 0) + (headings.includes(term) ? 3 : 0) + (text.includes(term) ? 1 : 0);
        if (!rank) return null;
        score += rank;
      }
      return { documentId: doc.id, title: doc.title, slug: doc.slug, score };
    }).filter((result): result is SearchResult => result !== null).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }
}
