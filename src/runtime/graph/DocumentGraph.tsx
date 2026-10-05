/** Coordinates graph cards, local layout, floating readers and persistent share state. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, applyNodeChanges, type NodeChange, type ReactFlowInstance, type Viewport } from "@xyflow/react";
import { Maximize, Pause, Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import { ShareStateService, type GraphViewState } from "../../application/services/ShareStateService";
import { BrowserStorage } from "../../infrastructure/persistence/BrowserStorage";
import { DocumentNode, type FlowDocumentNode } from "./DocumentNode";
import { GraphPhysicsService, type PhysicsNode } from "./GraphPhysicsService";
import { GraphShareControls } from "./GraphShareControls";
import { useTheme } from "../context/ThemeRuntimeContext";
import "@xyflow/react/dist/style.css";

const nodeTypes = { document: DocumentNode };
const defaultCamera = { x: 0, y: 0, zoom: 0.8 };
const storageKey = "rdocser:graph:v1";
const compact = { width: 280, height: 184 };
const expanded = { width: 520, height: 440 };
const gridPosition = (index: number) => ({ x: (index % 4) * 340, y: Math.floor(index / 4) * 248 });
function loadState(shared?: string): GraphViewState | null {
  const service = new ShareStateService();
  if (shared) return service.decode(shared);
  const stored = new BrowserStorage().get<string>(storageKey);
  return typeof stored === "string" ? service.decode(stored) : null;
}
function GraphWorkspace({ documents, activeId, shared, onRead }: { documents: DocumentManifestEntry[]; activeId?: string; shared?: string; onRead: (id: string) => void }) {
  const theme = useTheme();
  const [restored] = useState(() => loadState(shared));
  const [notice, setNotice] = useState(shared && !restored ? "This graph link is invalid. A fresh graph is shown." : "");
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches || theme.animation === false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [revision, setRevision] = useState(0);
  const [viewport, setViewport] = useState<Viewport>(restored?.camera ?? defaultCamera);
  const [instance, setInstance] = useState<ReactFlowInstance<FlowDocumentNode> | null>(null);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const physics = useMemo(() => new GraphPhysicsService(), []);
  const nodesRef = useRef<FlowDocumentNode[]>([]);
  const anchor = useRef<string | null>(null);
  const homes = useRef(new Map(documents.map((doc, index) => [doc.id, restored?.anchors?.[doc.id] ?? restored?.positions[doc.id] ?? gridPosition(index)])));
  const sizes = useRef({ ...restored?.sizes });
  const interaction = useCallback((reason: string, value: boolean) => {
    if (value) { anchor.current = reason.replace(/^resize:/, ""); physics.pause(reason); }
    else { setRevision(current => current + 1); physics.resume(reason); }
  }, [physics]);
  const setMode = useCallback((id: string, mode: "open" | "closed" | "floating") => {
    const existing = nodesRef.current.find(node => node.id === id);
    if (!existing) return;
    if (mode !== "closed" && !existing.data.open && !existing.data.floating && nodesRef.current.filter(node => node.data.open || node.data.floating).length >= 5) {
      setNotice("Five readers are already open. Close a card or popup to open another."); return;
    }
    if (existing.data.open) sizes.current[id] = { width: Number(existing.width ?? expanded.width), height: Number(existing.height ?? expanded.height) };
    const size = mode === "open" ? (sizes.current[id] ?? expanded) : compact;
    anchor.current = mode === "open" ? id : null;
    setNotice("");
    setNodes(current => current.map(node => node.id !== id ? node : {
      ...node, ...size, style: size, data: { ...node.data, open: mode === "open", floating: mode === "floating" },
    }));
    setRevision(current => current + 1);
  }, []);
  const toggle = useCallback((id: string) => {
    const node = nodesRef.current.find(node => node.id === id);
    if (node) setMode(id, node.data.open ? "closed" : "open");
  }, [setMode]);
  const detach = useCallback((id: string) => {
    const node = nodesRef.current.find(node => node.id === id);
    if (node?.data.floating) {
      // The popup remains mounted; focus its move handle to bring it to the front.
      document.getElementById(`popup-${id}`)?.focus();
      return;
    }
    setMode(id, "floating");
  }, [setMode]);
  const closePopup = useCallback((id: string) => setMode(id, "closed"), [setMode]);
  const navigate = useCallback((id: string) => {
    if (!nodesRef.current.find(node => node.id === id)?.data.open) setMode(id, "open");
    // The frame lets React Flow measure the expanded card before fitting it.
    requestAnimationFrame(() => { void instance?.fitView({ nodes: [{ id }], padding: 0.3, maxZoom: 1, duration: pausedRef.current ? 0 : 250 }); });
  }, [instance, setMode]);
  const [nodes, setNodes] = useState<FlowDocumentNode[]>(() => documents.map((doc, index) => {
    const open = restored?.open.includes(doc.id) ?? false;
    const size = open ? (restored?.sizes[doc.id] ?? expanded) : compact;
    return { id: doc.id, type: "document", position: restored?.positions[doc.id] ?? gridPosition(index), dragHandle: ".node-drag-handle", ...size,
      data: { document: doc, open, floating: false, toggle, detach, closePopup, navigate, read: onRead, interaction }, style: size };
  }));
  nodesRef.current = nodes;
  const edges = useMemo(() => {
    const byId = new Map(nodes.map(node => [node.id, node]));
    return documents.flatMap(doc => doc.relations.map(relation => {
      const source = byId.get(relation.source);
      const target = byId.get(relation.target);
      const dx = (target?.position.x ?? 0) - (source?.position.x ?? 0);
      const dy = (target?.position.y ?? 0) - (source?.position.y ?? 0);
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      const sourceHandle = `source-${horizontal ? (dx >= 0 ? "right" : "left") : (dy >= 0 ? "bottom" : "top")}`;
      const targetHandle = `target-${horizontal ? (dx >= 0 ? "left" : "right") : (dy >= 0 ? "top" : "bottom")}`;
      const connected = !focusedNode || relation.source === focusedNode || relation.target === focusedNode;
      return {
        id: `${relation.source}:${relation.target}:${relation.kind}`, source: relation.source, target: relation.target,
        sourceHandle, targetHandle, label: relation.kind === "link" ? undefined : relation.kind, type: "smoothstep",
        pathOptions: { offset: 44, stepPosition: horizontal ? 0.52 : 0.48 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--graph-edge)" },
        style: { stroke: "var(--graph-edge)", strokeWidth: connected ? 1.4 : 1, opacity: connected ? 0.92 : 0.14 },
      };
    }));
  }, [documents, nodes, focusedNode]);
  const physicsNodes = useCallback((): PhysicsNode[] => nodesRef.current.map(node => ({
    id: node.id, x: node.position.x, y: node.position.y, width: Number(node.width ?? compact.width), height: Number(node.height ?? compact.height),
    anchorX: homes.current.get(node.id)?.x, anchorY: homes.current.get(node.id)?.y, pinned: anchor.current === node.id,
  })), []);
  useEffect(() => {
    const unsubscribe = physics.subscribe(positions => {
      const updates = new Map(positions.map(position => [position.id, position]));
      setNodes(current => current.map(node => {
        const position = updates.get(node.id);
        return !position || node.dragging || anchor.current === node.id ? node : { ...node, position: { x: position.x, y: position.y } };
      }));
    });
    physics.start(physicsNodes(), edges);
    return () => { unsubscribe(); physics.stop(); };
  }, [physics, physicsNodes, edges]);
  useEffect(() => { paused ? physics.pause() : physics.resume(); }, [paused, physics]);
  useEffect(() => { physics.update(physicsNodes()); }, [revision, physics, physicsNodes]);
  useEffect(() => {
    setNodes(current => current.map(node => ({ ...node, data: { ...node.data, toggle, detach, closePopup, navigate, read: onRead, interaction } })));
  }, [toggle, detach, closePopup, navigate, onRead, interaction]);
  useEffect(() => { if (activeId) navigate(activeId); }, [activeId, navigate]);
  const capture = useCallback((): GraphViewState => ({
    version: 1, open: nodesRef.current.filter(node => node.data.open).map(node => node.id), camera: instance?.getViewport() ?? viewport,
    positions: Object.fromEntries(nodesRef.current.map(node => [node.id, { x: Math.round(node.position.x), y: Math.round(node.position.y) }])),
    anchors: Object.fromEntries(homes.current),
    sizes: Object.fromEntries(nodesRef.current.filter(node => node.data.open).map(node => [node.id, { width: Math.round(Number(node.width ?? expanded.width)), height: Math.round(Number(node.height ?? expanded.height)) }])),
  }), [instance, viewport]);
  useEffect(() => {
    const timer = window.setTimeout(() => { try { new BrowserStorage().set(storageKey, new ShareStateService().encode(capture())); } catch { /* Persistence is optional. */ } }, 250);
    return () => window.clearTimeout(timer);
  }, [nodes, viewport, capture]);
  const reset = () => {
    anchor.current = null;
    homes.current = new Map(documents.map((doc, index) => [doc.id, gridPosition(index)]));
    setNodes(current => current.map((node, index) => ({ ...node, position: gridPosition(index) })));
    setRevision(current => current + 1);
    requestAnimationFrame(() => { void instance?.fitView({ padding: 0.2, duration: paused ? 0 : 250 }); });
  };
  return <section className="graph-workspace" aria-label="Document graph">
    <div className="graph-toolbar"><div><strong>Connected knowledge</strong><Badge variant="secondary">{documents.length} documents · {edges.length} connections</Badge></div><div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => setPaused(current => !current)} aria-pressed={!paused}>{paused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}{paused ? "Resume physics" : "Pause physics"}</Button>
      <Button variant="outline" size="icon-sm" aria-label="Fit graph to view" title="Fit all documents" onClick={() => { void instance?.fitView({ padding: 0.2, duration: paused ? 0 : 250 }); }}><Maximize /></Button>
      <Button variant="outline" size="icon-sm" aria-label="Reset graph layout" title="Reset document positions" onClick={reset}><RotateCcw /></Button>
      <GraphShareControls capture={capture} />
    </div></div>
    {notice && <Alert className="graph-notice"><AlertDescription>{notice}</AlertDescription><Button variant="ghost" size="xs" onClick={() => setNotice("")}>Dismiss</Button></Alert>}
    <div className="graph-canvas"><ReactFlow<FlowDocumentNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={(changes: NodeChange<FlowDocumentNode>[]) => setNodes(current => applyNodeChanges(changes, current))} onInit={setInstance} defaultViewport={restored?.camera ?? defaultCamera} fitView={!restored} minZoom={0.1} maxZoom={2} colorMode={theme.colorMode} nodesConnectable={false} deleteKeyCode={null}
      onNodeDragStart={(_, node) => { anchor.current = node.id; physics.pause("drag"); }} onNodeDragStop={(_, node) => { homes.current.set(node.id, node.position); setRevision(current => current + 1); physics.resume("drag"); }}
      onMoveEnd={(_, camera) => setViewport(camera)} onNodeMouseEnter={(_, node) => setFocusedNode(node.id)} onNodeMouseLeave={() => setFocusedNode(null)} onNodeDoubleClick={(event, node) => { if ((event.target as Element).closest(".node-drag-handle") && !(event.target as Element).closest(".nodrag")) toggle(node.id); }} proOptions={{ hideAttribution: false }}>
      <Background gap={24} size={1} color="var(--border)" /><Controls showInteractive={false} /><MiniMap pannable zoomable nodeColor="var(--primary)" maskColor="color-mix(in srgb, var(--background), transparent 25%)" />
    </ReactFlow></div>
    <div className="graph-hint"><span>Open to make room · Pop out to place on canvas · Drag to arrange</span><span>{nodes.filter(node => node.data.open || node.data.floating).length} / 5 readers · {nodes.filter(node => node.data.floating).length} detached</span></div>
  </section>;
}
export function DocumentGraph(props: Parameters<typeof GraphWorkspace>[0]) { return <ReactFlowProvider><GraphWorkspace {...props} /></ReactFlowProvider>; }
