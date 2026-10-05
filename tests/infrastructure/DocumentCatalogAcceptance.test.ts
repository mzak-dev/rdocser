/** Exercises 500 discovered documents through metadata, links and full-text search. */
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { DocumentFileScanner } from "../../src/infrastructure/filesystem/DocumentFileScanner";
import { SearchIndexService } from "../../src/application/services/SearchIndexService";
import { DocumentGraphService } from "../../src/application/services/DocumentGraphService";

it("indexes a 500-document catalog with nested identities and relations", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-500-"));
  try {
    await mkdir(path.join(root, "guides"));
    await Promise.all(Array.from({ length: 500 }, (_, index) => writeFile(path.join(root, `guides/topic-${index}.md`), `---\ntitle: Topic ${index}\n---\n# Topic ${index}\n\nA searchable discovery ${index}.\n\n[Next](./topic-${(index + 1) % 500}.md)`)));
    const docs = await new DocumentFileScanner().scanDocuments(root);
    expect(docs).toHaveLength(500);
    expect(docs.flatMap(doc => doc.relations)).toHaveLength(500);
    const graph = new DocumentGraphService().buildManifestGraph(docs);
    expect(graph.nodes).toHaveLength(500);
    expect(graph.edges).toHaveLength(500);
    const search = new SearchIndexService();
    search.build(docs.map(doc => ({ ...doc, slug: doc.id, headings: doc.headings.map(heading => heading.title) })));
    expect(search.search("discovery 499")[0].documentId).toBe("guides/topic-499");
  } finally { await rm(root, { recursive: true, force: true }); }
}, 10000);

it("fails clearly for invalid frontmatter and dangling explicit relations", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-invalid-"));
  try {
    const source = path.join(root, "broken.mdx");
    await writeFile(source, "---\ntype: video\n---\n# Broken");
    await expect(new DocumentFileScanner().scanDocuments(root)).rejects.toThrow("broken.mdx: type must be article or presentation");
    await writeFile(source, "---\nrelations:\n  - target: does-not-exist\n---\n# Broken");
    await expect(new DocumentFileScanner().scanDocuments(root)).rejects.toThrow("broken.mdx: unknown relation target does-not-exist");
  } finally { await rm(root, { recursive: true, force: true }); }
});
