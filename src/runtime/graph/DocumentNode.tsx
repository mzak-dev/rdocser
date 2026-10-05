/** Graph card and floating reader share one content host, preserving MDX state and scroll. */
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, NodeResizer, ViewportPortal, type Node, type NodeProps } from "@xyflow/react";
import { ArrowUpRight, BookOpen, ChevronDown, Minus, PanelsTopLeft, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { DocumentRenderer } from "../components/DocumentRenderer";
import { FloatingArticle } from "./FloatingArticle";
export interface DocumentNodeData extends Record<string, unknown> {
  document: DocumentManifestEntry;
  open: boolean;
  floating: boolean;
  toggle: (id: string) => void;
  detach: (id: string) => void;
  closePopup: (id: string) => void;
  navigate: (id: string) => void;
  read: (id: string) => void;
  interaction: (reason: string, paused: boolean) => void;
}
export type FlowDocumentNode = Node<DocumentNodeData, "document">;
export const DocumentNode = memo(function DocumentNode({ id, data }: NodeProps<FlowDocumentNode>) {
  const doc = data.document;
  const inline = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const popupButton = useRef<HTMLButtonElement>(null);
  const wasFloating = useRef(false);
  const scrollPosition = useRef(0);
  const [host] = useState(() => {
    const element = document.createElement("div"); element.className = "node-document-content nodrag nowheel nopan"; return element;
  });
  useLayoutEffect(() => {
    const target = data.floating ? popup.current : inline.current;
    // Move the existing DOM host; changing a React portal target would remount MDX.
    const scroll = scrollPosition.current;
    if (target) { target.appendChild(host); host.scrollTop = scroll; }
    else host.remove();
    if (wasFloating.current && !data.floating) popupButton.current?.focus({ preventScroll: true });
    wasFloating.current = data.floating;
  }, [data.open, data.floating, host]);
  useEffect(() => {
    const remember = () => { if (host.isConnected) scrollPosition.current = host.scrollTop; };
    host.addEventListener("scroll", remember);
    return () => host.removeEventListener("scroll", remember);
  }, [host]);
  return <article className="document-node" data-expanded={data.open} data-floating={data.floating}>
    <NodeResizer isVisible={data.open} minWidth={360} minHeight={320} maxWidth={1600} maxHeight={1600} onResizeStart={() => data.interaction(`resize:${id}`, true)} onResizeEnd={() => data.interaction(`resize:${id}`, false)} />
    <Handle id="target-left" type="target" position={Position.Left} className="graph-handle" />
    <Handle id="source-left" type="source" position={Position.Left} className="graph-handle" />
    <Handle id="target-right" type="target" position={Position.Right} className="graph-handle" />
    <Handle id="source-right" type="source" position={Position.Right} className="graph-handle" />
    <Handle id="target-top" type="target" position={Position.Top} className="graph-handle" />
    <Handle id="source-top" type="source" position={Position.Top} className="graph-handle" />
    <Handle id="target-bottom" type="target" position={Position.Bottom} className="graph-handle" />
    <Handle id="source-bottom" type="source" position={Position.Bottom} className="graph-handle" />
    <header className="node-drag-handle"><div className="node-type-icon">{doc.type === "presentation" ? <Presentation /> : <BookOpen />}</div><div className="node-heading"><strong>{doc.title}</strong><span>{doc.group}</span></div><Button variant="ghost" size="icon-sm" className="nodrag" aria-expanded={data.open} aria-label={data.open ? `Close ${doc.title}` : `Expand ${doc.title}`} title={data.open ? "Collapse card" : "Read in graph"} onClick={() => data.toggle(id)}>{data.open ? <Minus /> : <ChevronDown />}</Button></header>
    {data.open ? <div ref={inline} className="node-content-slot" /> : <button className="node-summary nodrag" onClick={() => data.toggle(id)}>{doc.description || "Open this document to explore its content."}</button>}
    <footer className="node-footer"><Badge variant="secondary">{doc.type === "presentation" ? "slides" : "article"}</Badge><div className="flex items-center gap-1">
      <Button ref={popupButton} variant={data.floating ? "secondary" : "ghost"} size="xs" className="nodrag" aria-label={`Open ${doc.title} in popup`} title="Detach into a movable canvas reader" onClick={() => data.detach(id)}><PanelsTopLeft data-icon="inline-start" />{data.floating ? "On canvas" : "Pop out"}</Button>
      <Button variant="ghost" size="icon-xs" className="nodrag" aria-label={`Read ${doc.title} page`} title="Read full page" onClick={() => data.read(id)}><ArrowUpRight /></Button>
    </div></footer>
    {(data.open || data.floating) && createPortal(<DocumentRenderer document={doc} onNavigate={data.navigate} hideTitle={doc.headings[0]?.level === 1} />, host)}
    {data.floating && <ViewportPortal><FloatingArticle id={id} title={doc.title} contentRef={popup} onDock={() => data.toggle(id)} onClose={() => data.closePopup(id)} /></ViewportPortal>}
  </article>;
});
