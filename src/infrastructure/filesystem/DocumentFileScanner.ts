/** Discovers trusted author content and produces validated browser-safe metadata. */
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Root, Link, Definition } from "mdast";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";

export class DocumentFileScanner {
  async scan(root: string): Promise<string[]> {
    const files: string[] = [];
    const walk = async (directory: string) => {
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) await walk(filename);
        else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) files.push(filename);
      }
    };
    await walk(path.resolve(root));
    return files.sort();
  }

  async scanDocuments(root: string): Promise<DocumentManifestEntry[]> {
    const files = await this.scan(root);
    const links = new Map<string, string[]>();
    const docs: DocumentManifestEntry[] = await Promise.all(files.map(async filename => {
      const relative = path.relative(root, filename).replaceAll("\\", "/");
      const id = relative.replace(/\.(md|mdx)$/i, "");
      const { data, content } = matter(await fs.readFile(filename, "utf8"));
      const fail = (message: string): never => { throw new Error(`${relative}: ${message}`); };
      for (const key of ["title", "group", "description"])
        if (data[key] !== undefined && (typeof data[key] !== "string" || !data[key].trim())) fail(`${key} must be a non-empty string`);
      if (data.type !== undefined && !["article", "presentation"].includes(data.type)) fail("type must be article or presentation");
      if (data.order !== undefined && (typeof data.order !== "number" || !Number.isFinite(data.order))) fail("order must be a finite number");
      const parser = unified().use(remarkParse).use(remarkGfm);
      if (/\.mdx$/i.test(filename)) parser.use(remarkMdx);
      const tree = parser.parse(content) as Root;
      const slugger = new GithubSlugger();
      const headings: DocumentManifestEntry["headings"] = [];
      visit(tree, "heading", node => { const title = toString(node); headings.push({ id: slugger.slug(title), title, level: node.depth }); });
      const urls: string[] = [];
      visit(tree, node => { if (node.type === "link" || node.type === "definition") urls.push((node as Link | Definition).url); });
      links.set(id, urls);
      const paragraphs: string[] = [];
      visit(tree, "paragraph", node => { const text = toString(node); if (text.trim()) paragraphs.push(text); });
      const text = tree.children.filter(node => node.type !== "mdxjsEsm").map(node => toString(node)).filter(value => value.trim()).join("\n\n");
      const folder = path.posix.dirname(relative);
      const title = data.title ?? headings.find(heading => heading.level === 1)?.title ?? path.basename(id);
      const group = data.group ?? (folder === "." ? "Getting started" : folder.split("/").map(part => part.charAt(0).toUpperCase() + part.slice(1).replaceAll("-", " ")).join(" / "));
      if (data.relations !== undefined && !Array.isArray(data.relations)) fail("relations must be an array");
      const relations = (data.relations ?? []).map((relation: unknown) => {
        if (typeof relation === "string") return { source: id, target: relation, kind: "related" };
        if (!relation || typeof relation !== "object" || !("target" in relation) || typeof relation.target !== "string" || ("kind" in relation && typeof relation.kind !== "string")) fail("each relation requires a string target and optional string kind");
        const valid = relation as { target: string; kind?: string };
        return { source: id, target: valid.target, kind: valid.kind ?? "related" };
      });
      return { id, title, group, order: data.order ?? 100, type: data.type ?? "article", sourcePath: relative,
        description: data.description ?? (paragraphs[0] ?? "").slice(0, 180), headings, relations, text,
        readingMinutes: Math.max(1, Math.ceil(text.split(/\s+/u).length / 220)) } satisfies DocumentManifestEntry;
    }));
    const ids = new Set<string>();
    for (const doc of docs) { if (ids.has(doc.id)) throw new Error(`Duplicate document id: ${doc.id}`); ids.add(doc.id); }
    for (const doc of docs) {
      for (const relation of doc.relations) {
        relation.target = relation.target.replace(/\.(md|mdx)$/i, "");
        if (!ids.has(relation.target)) throw new Error(`${doc.sourcePath}: unknown relation target ${relation.target}`);
      }
      for (const url of links.get(doc.id) ?? []) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) continue;
        let target: string;
        try { target = decodeURIComponent(url.split(/[?#]/)[0]); } catch { continue; }
        target = path.posix.normalize(target.startsWith("/") ? target.slice(1) : path.posix.join(path.posix.dirname(doc.sourcePath), target)).replace(/\.(md|mdx)$/i, "");
        if (ids.has(target) && target !== doc.id && !doc.relations.some(relation => relation.target === target)) doc.relations.push({ source: doc.id, target, kind: "link" });
      }
    }
    return docs.sort((a, b) => a.order - b.order || a.sourcePath.localeCompare(b.sourcePath));
  }
}
