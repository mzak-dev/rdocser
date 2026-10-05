/** Resolves authored document links into manifest identities and heading anchors. */
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
export class DocumentLinkService {
  constructor(private readonly documents: DocumentManifestEntry[]) {}
  resolve(href: string, source: DocumentManifestEntry): { document: DocumentManifestEntry; heading?: string } | null {
    if (href.startsWith("#/")) return null;
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return null;
    try {
      const url = new URL(href, `https://content.local/${source.sourcePath}`);
      const id = decodeURIComponent(url.pathname).slice(1).replace(/\.(md|mdx)$/i, "");
      const document = this.documents.find(doc => doc.id === id);
      return document ? { document, heading: url.hash ? decodeURIComponent(url.hash.slice(1)) : undefined } : null;
    } catch { return null; }
  }
}
