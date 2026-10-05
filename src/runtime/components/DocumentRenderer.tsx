/** Renders compiled author MDX behind loading and error boundaries. */
import { Component, lazy, Suspense, useEffect, useRef, useMemo, type ReactNode, type ErrorInfo } from "react";
import type { MDXComponents } from "mdx/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { documentManifest } from "virtual:rdocser/documents";
import { DocumentLinkService } from "../../application/services/DocumentLinkService";
import { HashRouter } from "../../application/services/HashRouter";
import { documentContentService } from "../content/DocumentContentService";
const RevealDeck = lazy(() => import("../reveal/RevealDeck").then(module => ({ default: module.RevealDeck })));
const Slide = lazy(() => import("../reveal/RevealDeck").then(module => ({ default: module.Slide })));
const Stack = lazy(() => import("../reveal/RevealDeck").then(module => ({ default: module.Stack })));
const Fragment = lazy(() => import("../reveal/RevealDeck").then(module => ({ default: module.Fragment })));

class ContentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Document rendering failed", error, info.componentStack); }
  render() {
    return this.state.failed ? <Alert variant="destructive"><AlertTitle>This document could not be loaded.</AlertTitle><AlertDescription>Please reload to try again.</AlertDescription><Button variant="outline" size="sm" onClick={() => window.location.reload()}>Reload</Button></Alert> : this.props.children;
  }
}
export function DocumentRenderer({ document: doc, onNavigate, hideTitle = false, heading }: { document: DocumentManifestEntry; onNavigate?: (id: string) => void; hideTitle?: boolean; heading?: string }) {
  const Content = documentContentService.get(doc.id);
  const components = useMemo<MDXComponents>(() => ({
    Deck: RevealDeck, Slide, Stack, Fragment,
    a: ({ href = "", children, ...props }) => {
      const link = new DocumentLinkService(documentManifest).resolve(href, doc);
      return <a {...props} href={link ? new HashRouter().document(link.document.id, link.document.type, link.heading) : href} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link && onNavigate) { event.preventDefault(); if (link.document.id === doc.id && link.heading) {
          const article = event.currentTarget.closest(".mdx-content");
          const target = Array.from(article?.querySelectorAll("[id]") ?? []).find(element => element.id === link.heading);
          target?.scrollIntoView({ block: "start" });
        } else onNavigate(link.document.id); }
      }}>{children}</a>;
    },
  }), [doc, onNavigate]);
  if (!Content) return <Alert><AlertTitle>Document unavailable</AlertTitle><AlertDescription>The source may have been removed. Choose another document.</AlertDescription></Alert>;
  return <ContentBoundary key={doc.id}><Suspense fallback={<div className="flex flex-col gap-4" role="status" aria-label="Loading document"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-40 w-full" /></div>}>
    <LoadedContent heading={heading}><div className="mdx-content" data-hide-title={hideTitle}><Content components={components} /></div></LoadedContent>
  </Suspense></ContentBoundary>;
}

function LoadedContent({ children, heading }: { children: ReactNode; heading?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (heading) Array.from(host.current?.querySelectorAll("[id]") ?? []).find(item => item.id === heading)?.scrollIntoView({ block: "start" });
  }, [heading]);
  return <div ref={host}>{children}</div>;
}

