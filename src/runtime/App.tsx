/** Coordinates generated content, hash routes and accessible desktop/mobile shells. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Menu, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { TooltipProvider } from "@/components/ui/tooltip";
import { documentManifest } from "virtual:rdocser/documents";
import { HashRouter, type ViewMode } from "../application/services/HashRouter";
import { AppShell } from "./components/AppShell";
import { ClassicLayout } from "./components/ClassicLayout";
import { GraphLayout } from "./components/GraphLayout";
import { HomeCatalog } from "./components/HomeCatalog";
import { DocumentRenderer } from "./components/DocumentRenderer";
import { DocumentSidebar } from "./navigation/DocumentSidebar";
import { SearchCommand } from "./navigation/SearchCommand";
import { ViewModeSwitcher } from "./navigation/ViewModeSwitcher";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { RdocserLogo } from "./components/RdocserLogo";
import { useTheme } from "./context/ThemeRuntimeContext";
const router = new HashRouter();
export function App() {
  const { branding } = useTheme();
  const projectName = branding?.name ?? "Rdocser";
  const [route, setRoute] = useState(() => router.read(window.location.hash));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 800px)").matches);
  const stage = useRef<HTMLElement>(null);
  const active = documentManifest.find(doc => doc.id === route.documentId);
  useEffect(() => {
    const changed = () => setRoute(router.read(window.location.hash));
    window.addEventListener("hashchange", changed);
    const query = window.matchMedia("(max-width: 800px)");
    const resized = () => setMobile(query.matches);
    query.addEventListener("change", resized);
    return () => { window.removeEventListener("hashchange", changed); query.removeEventListener("change", resized); };
  }, []);
  useEffect(() => {
    document.title = `${active?.title ?? (route.mode === "graph" ? "Explore" : "Overview")} · ${projectName}`;
    if (!route.heading) stage.current?.scrollTo({ top: 0 });
  }, [active, route.mode, route.heading, projectName]);
  const read = useCallback((id: string) => {
    const doc = documentManifest.find(document => document.id === id);
    window.location.hash = doc ? router.document(id, doc.type) : "#/";
    setMobileOpen(false);
  }, []);
  const select = useCallback((id: string) => {
    if (route.mode === "graph" && id) window.location.hash = router.graph(id, route.shared);
    else read(id);
    setMobileOpen(false);
  }, [route.mode, route.shared, read]);
  const changeMode = (mode: ViewMode) => { if (mode === "graph") window.location.hash = router.graph(active?.id); else read(active?.id ?? ""); };
  if (route.standalone && active?.type === "presentation") return <div className="standalone-view"><div className="standalone-toolbar"><Button variant="outline" onClick={() => read(active.id)}><ArrowLeft data-icon="inline-start" />Back to documentation</Button><strong>{active.title}</strong><Badge variant="secondary">Presentation</Badge></div><DocumentRenderer document={active} /></div>;
  const sidebar = <DocumentSidebar documents={documentManifest} activeId={route.documentId} onSelect={select} graph={route.mode === "graph"} />;
  const content = <main id="main-content" tabIndex={-1} className="content-stage" ref={stage} data-mode={route.mode}>
    {route.mode === "graph" ? <GraphLayout documents={documentManifest} activeId={route.documentId} shared={route.shared} onRead={read} /> : active ? <ClassicLayout document={active} documents={documentManifest} onSelect={read} heading={route.heading} /> : route.documentId ? <Empty><EmptyHeader><EmptyTitle>Document not found</EmptyTitle><EmptyDescription>This page may have moved or been removed.</EmptyDescription></EmptyHeader><EmptyContent><Button onClick={() => read("")}>Back to overview</Button></EmptyContent></Empty> : <HomeCatalog documents={documentManifest} onSelect={read} onExplore={() => changeMode("graph")} />}
  </main>;
  return <TooltipProvider delayDuration={300}><AppShell>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); stage.current?.focus(); }}>Skip to content</a>
    <header className="topbar">
      <div className="header-brand">{mobile && <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent side="left"><SheetHeader><SheetTitle>Documentation</SheetTitle><SheetDescription>Browse the project library.</SheetDescription></SheetHeader>{sidebar}</SheetContent></Sheet>}
        <a className="brand" href="#/" onClick={event => { event.preventDefault(); read(""); }} aria-label={`${projectName} overview`}>{branding?.logo ? <img src={branding.logo} alt="" className="size-10 object-contain" /> : <RdocserLogo />}<strong>{branding?.name ?? "rdocser"}<span className="brand-dot">.</span></strong></a><Badge variant="outline" className="version-badge">v0.1</Badge>
      </div><SearchCommand documents={documentManifest} onSelect={select} /><ViewModeSwitcher mode={route.mode} onChange={changeMode} /><ThemeSwitcher />
    </header>
    <div className="workspace">
      {mobile ? content : <ResizablePanelGroup orientation="horizontal" id="documentation-layout"><ResizablePanel id="navigation" defaultSize="23%" minSize="220px" maxSize="35%"><aside className="sidebar-panel">{sidebar}</aside></ResizablePanel><ResizableHandle aria-label="Resize navigation" /><ResizablePanel id="content" defaultSize="77%" minSize="50%">{content}</ResizablePanel></ResizablePanelGroup>}
    </div>
    <footer className="statusbar"><span><span className="status-dot" />{documentManifest.length} documents in your library</span><span>{route.mode === "graph" ? <Network /> : <ChevronRight />}{route.mode === "graph" ? "Explore the connections" : "Follow your curiosity"}<kbd>Ctrl K</kbd></span></footer>
  </AppShell></TooltipProvider>;
}


