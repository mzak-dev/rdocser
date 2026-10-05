/** Presents the generated catalog as a focused starting point for readers. */
import { ArrowRight, BookOpen, FileText, Network, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { HashRouter } from "../../application/services/HashRouter";
export function HomeCatalog({ documents, onSelect, onExplore }: { documents: DocumentManifestEntry[]; onSelect: (id: string) => void; onExplore: () => void }) {
  const first = documents.find(doc => doc.type === "article");
  const groups = [...new Set(documents.map(doc => doc.group))];
  return <section className="catalog">
    <div className="catalog-intro"><Badge variant="outline"><BookOpen data-icon="inline-start" /> THE DOCUMENTATION WORKSPACE</Badge>
      <h1>A little clarity.<br /><span>A lot to explore.</span></h1>
      <p>Your project's knowledge, connected. Read at your own pace, follow an idea, or see how everything fits together.</p>
      <div className="flex flex-wrap gap-3"><Button size="lg" disabled={!first} onClick={() => first && onSelect(first.id)}>Start reading <ArrowRight data-icon="inline-end" /></Button><Button variant="outline" size="lg" onClick={onExplore}><Network data-icon="inline-start" />Explore the graph</Button></div>
    </div>
    <div className="catalog-stats"><span><strong>{documents.length}</strong> documents</span><span><strong>{groups.length}</strong> collections</span><span><strong>{documents.filter(doc => doc.type === "presentation").length}</strong> presentations</span></div>
    <Separator />
    <div className="section-heading"><div><p className="eyebrow">YOUR LIBRARY</p><h2>Find your next idea</h2></div><span>Choose a place to begin</span></div>
    {!documents.length && <Empty><EmptyHeader><EmptyTitle>Your library is ready</EmptyTitle><EmptyDescription>Add a Markdown or MDX document to begin.</EmptyDescription></EmptyHeader></Empty>}
    <div className="catalog-grid">{groups.map((group, index) => {
      const items = documents.filter(doc => doc.group === group);
      const Icon = items.every(doc => doc.type === "presentation") ? Presentation : index === 0 ? BookOpen : FileText;
      return <Card key={group} className="collection-card"><CardHeader><div className="collection-icon"><Icon /></div><CardTitle>{group}</CardTitle><CardDescription>{items.length} {items.length === 1 ? "document" : "documents"} · {items.reduce((sum, doc) => sum + doc.readingMinutes, 0)} min to explore</CardDescription></CardHeader>
        <CardContent><div className="collection-links">{items.slice(0, 4).map(doc => <a key={doc.id} href={new HashRouter().document(doc.id, doc.type)} onClick={event => { event.preventDefault(); onSelect(doc.id); }}><span>{doc.title}</span><ArrowRight /></a>)}</div></CardContent>
        <CardFooter><Button variant="ghost" size="sm" onClick={() => onSelect(items[0].id)}>Open collection <ArrowRight data-icon="inline-end" /></Button></CardFooter>
      </Card>;
    })}</div>
    <div className="catalog-note"><Network /><div><strong>Good ideas don't live in isolation.</strong><p>Explore the connections between documents in graph view.</p></div><Button variant="ghost" size="sm" onClick={onExplore}>Take a look <ArrowRight data-icon="inline-end" /></Button></div>
  </section>;
}
