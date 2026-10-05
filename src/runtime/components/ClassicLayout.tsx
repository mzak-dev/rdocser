/** Combines article content, table of contents and sequential reading navigation. */
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { HashRouter } from "../../application/services/HashRouter";
import { DocumentRenderer } from "./DocumentRenderer";
export function ClassicLayout({ document: doc, documents, onSelect, heading }: { document: DocumentManifestEntry; documents: DocumentManifestEntry[]; onSelect: (id: string) => void; heading?: string }) {
  const index = documents.findIndex(document => document.id === doc.id);
  const previous = documents[index - 1];
  const next = documents[index + 1];
  return <section className="reader-layout"><article className="document-pane">
    <div className="document-meta"><Badge variant="secondary">{doc.type === "presentation" ? "Presentation" : doc.group}</Badge><span><Clock />{doc.readingMinutes} min read</span></div>
    <h1 className="document-title">{doc.title}</h1>
    {doc.type === "presentation" && <div className="presentation-intro"><p>Use the arrows to navigate. Focus the deck to control it with your keyboard.</p><Button variant="outline" size="sm" asChild><a href={new HashRouter().document(doc.id, "present")}><Presentation data-icon="inline-start" />Present <ExternalLink data-icon="inline-end" /></a></Button></div>}
    <div key={doc.id}>
      <DocumentRenderer document={doc} hideTitle={doc.headings[0]?.level === 1} heading={heading} />
    </div>
    <Separator className="my-10" />
    <div className="reading-navigation">{previous ? <Button variant="ghost" onClick={() => onSelect(previous.id)}><ArrowLeft data-icon="inline-start" /><span>{previous.title}</span></Button> : <span />}{next && <Button variant="ghost" onClick={() => onSelect(next.id)}><span>{next.title}</span><ArrowRight data-icon="inline-end" /></Button>}</div>
    <p className="document-source">{doc.sourcePath}</p>
  </article>
  {doc.type === "article" && doc.headings.length > 1 && <aside className="table-of-contents" aria-label="On this page"><p>ON THIS PAGE</p>{doc.headings.filter(item => item.level > 1 && item.level < 4).map(item => <a key={item.id} href={new HashRouter().document(doc.id, doc.type, item.id)} data-level={item.level}>{item.title}</a>)}</aside>}
  </section>;
}
