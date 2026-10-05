/** Checks the content pipeline through actual files, including nested MDX and links. */
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { DocumentFileScanner } from "../../src/infrastructure/filesystem/DocumentFileScanner";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

it("discovers nested documents and resolves their metadata, headings and relative relations", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-scanner-"));
  roots.push(root);
  await mkdir(path.join(root, "guides"));
  await writeFile(path.join(root, "start.mdx"), "---\ntitle: Start here\norder: 1\n---\n# Start\n\n[Guide](./guides/install.md#install)\n\n## Try it\n\n## Try it\n");
  await writeFile(path.join(root, "guides/install.md"), "---\ngroup: Setup\n---\n# Install\n\nRun npm install.");
  const docs = await new DocumentFileScanner().scanDocuments(root);
  expect(docs.map(doc => doc.id)).toEqual(["start", "guides/install"]);
  expect(docs[0]).toMatchObject({ title: "Start here", order: 1, type: "article", relations: [{ source: "start", target: "guides/install", kind: "link" }] });
  expect(docs[0].headings.map(heading => heading.id)).toEqual(["start", "try-it", "try-it-1"]);
  expect(docs[1]).toMatchObject({ title: "Install", group: "Setup" });
});
