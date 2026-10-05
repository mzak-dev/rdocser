/** Groups generated documents into navigable sections with real hash links. */
import { ArrowUpRight, BookOpen, FileText, Home, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HashRouter } from "../../application/services/HashRouter";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { useTheme } from "../context/ThemeRuntimeContext";
export function DocumentSidebar({ documents, activeId, onSelect, graph = false }: { documents: DocumentManifestEntry[]; activeId?: string; onSelect: (id: string) => void; graph?: boolean }) {
  const groups = [...new Set(documents.map(doc => doc.group))];
  const { branding } = useTheme();
  const router = new HashRouter();
  const projectPlan = documents.find(doc => doc.id === "adr/0001-project-plan");
  return <div className="sidebar-inner">
    <div className="sidebar-project"><div className="project-icon">{branding?.logo ? <img src={branding.logo} alt="" className="size-8 object-contain" /> : <BookOpen />}</div><div><strong>{branding?.name ?? "Rdocser"}</strong><p>Project documentation</p></div></div>
    <Separator />
    <nav className="document-sidebar" aria-label="Documents">
      <Button variant="ghost" className={cn("nav-link", !activeId && !graph && "nav-current")} asChild>
        <a href="#/" onClick={event => { event.preventDefault(); onSelect(""); }} aria-current={!activeId && !graph ? "page" : undefined}><Home data-icon="inline-start" />Overview</a>
      </Button>
      {groups.map(group => <section key={group}><h2>{group}</h2><div className="flex flex-col gap-1">{documents.filter(doc => doc.group === group).map(doc => <Button variant="ghost" className={cn("nav-link", doc.id === activeId && "nav-current")} key={doc.id} asChild>
        <a href={graph ? router.graph(doc.id) : router.document(doc.id, doc.type)} onClick={event => { event.preventDefault(); onSelect(doc.id); }} aria-current={doc.id === activeId ? "page" : undefined}>
          {doc.type === "presentation" ? <Presentation data-icon="inline-start" /> : <FileText data-icon="inline-start" />}<span className="truncate">{doc.title}</span>
        </a>
      </Button>)}</div></section>)}
    </nav>
    <div className="sidebar-bottom"><Separator /><p>Made for curious minds.</p>{projectPlan ? <a href={router.document(projectPlan.id)} onClick={event => { event.preventDefault(); onSelect(projectPlan.id); }}>About this workspace <ArrowUpRight /></a> : <p>{documents.length} documents to discover.</p>}</div>
  </div>;
}
