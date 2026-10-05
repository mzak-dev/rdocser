/** Verifies full-content discovery and useful ranking through the public search service. */
import { expect, it } from "vitest";
import { SearchIndexService } from "../../src/application/services/SearchIndexService";
it("matches all words across collections, headings and body and ranks titles first", () => {
  const search = new SearchIndexService();
  search.build([
    { id: "body", slug: "body", title: "Overview", type: "article", group: "Guides", headings: ["Worker layout"], text: "Graph physics and card resize" },
    { id: "title", slug: "title", title: "Graph physics", type: "article", group: "Guides", headings: [], text: "Interactive maps" },
  ]);
  expect(search.search("graph physics").map(result => result.documentId)).toEqual(["title", "body"]);
  expect(search.search("guides worker resize").map(result => result.documentId)).toEqual(["body"]);
  expect(search.search("missing graph")).toEqual([]);
  expect(search.search("   ")).toEqual([]);
});
