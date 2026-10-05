/** An independent reader in graph coordinates, sharing the canvas camera but not its physics. */
import { useId, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";
import { ArrowDownLeft, GripHorizontal, MoveDiagonal2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
let topWindow = 20;
export function FloatingArticle({ id, title, contentRef, onDock, onClose }: {
  id: string; title: string; contentRef: RefObject<HTMLDivElement | null>; onDock: () => void; onClose: () => void;
}) {
  const titleId = useId();
  const flow = useReactFlow();
  const panel = useRef<HTMLElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ kind: "move" | "resize"; x: number; y: number; zoom: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const [position, setPosition] = useState(() => {
    const node = flow.getNode(id);
    return { x: (node?.position.x ?? 0) + (node?.width ?? 280) + 48, y: node?.position.y ?? 0 };
  });
  const [size, setSize] = useState({ width: 560, height: 600 });
  const [layer, setLayer] = useState(() => ++topWindow);
  // Focusing the move handle also retrieves readers placed outside the current camera.
  const reveal = () => {
    const bounds = panel.current?.getBoundingClientRect();
    const canvas = panel.current?.closest(".react-flow")?.getBoundingClientRect();
    if (bounds && canvas && (bounds.left < canvas.left || bounds.top < canvas.top || bounds.right > canvas.right || bounds.bottom > canvas.bottom)) {
      void flow.fitBounds({ ...position, ...size }, { padding: 0.12, duration: 0 });
    }
  };
  useLayoutEffect(() => { handle.current?.focus({ preventScroll: true }); }, []);
  const begin = (event: PointerEvent<HTMLElement>, kind: "move" | "resize") => {
    if (event.button !== 0) return;
    event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { kind, x: event.clientX, y: event.clientY, zoom: flow.getZoom(), startX: position.x, startY: position.y, ...size };
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const start = gesture.current;
    if (!start) return;
    const dx = (event.clientX - start.x) / start.zoom;
    const dy = (event.clientY - start.y) / start.zoom;
    if (start.kind === "move") setPosition({ x: start.startX + dx, y: start.startY + dy });
    else setSize({ width: Math.max(340, Math.min(1600, start.width + dx)), height: Math.max(280, Math.min(1600, start.height + dy)) });
  };
  const end = (event: PointerEvent<HTMLElement>) => {
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <section ref={panel} role="dialog" aria-modal="false" aria-labelledby={titleId} className="floating-article nodrag nopan nowheel" style={{ left: position.x, top: position.y, ...size, zIndex: layer }}
    onPointerDown={event => { event.stopPropagation(); setLayer(++topWindow); }} onClick={event => event.stopPropagation()}
    onFocusCapture={() => setLayer(++topWindow)} onKeyDown={event => {
      event.stopPropagation();
      if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); onClose(); }
    }}>
    <header className="floating-article-toolbar">
      <div id={`popup-${id}`} ref={handle} className="floating-article-handle" tabIndex={0} role="button" aria-label={`Move ${title} popup`} aria-describedby={`${titleId}-help`} onFocus={reveal}
        onPointerDown={event => begin(event, "move")} onPointerMove={move} onPointerUp={end}
        onPointerCancel={end} onLostPointerCapture={() => { gesture.current = null; }}
        onKeyDown={event => {
          const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          const direction = directions[event.key];
          if (direction) { event.preventDefault(); const step = (event.shiftKey ? 40 : 12) / flow.getZoom(); setPosition(current => ({ x: current.x + direction[0] * step, y: current.y + direction[1] * step })); }
        }}>
        <GripHorizontal aria-hidden="true" /><div><span>CANVAS READER</span><h2 id={titleId}>{title}</h2></div>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={`Return ${title} to graph`} title="Return to card" onClick={onDock}><ArrowDownLeft /></Button>
      <Button variant="ghost" size="icon-sm" aria-label={`Close ${title} popup`} title="Close reader (Esc)" onClick={onClose}><X /></Button>
    </header>
    <div ref={contentRef} className="floating-article-body" />
    <footer id={`${titleId}-help`} className="floating-article-hint">Drag to place on canvas · Pan and zoom with the graph · Esc to close</footer>
    <Button variant="ghost" size="icon-xs" className="floating-article-resize" aria-label={`Resize ${title} reader`} title="Drag to resize, or use arrow keys"
      onPointerDown={event => begin(event, "resize")} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { gesture.current = null; }}
      onKeyDown={event => {
        const step = (event.shiftKey ? 40 : 12) / flow.getZoom();
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          setSize(current => ({ width: Math.max(340, Math.min(1600, current.width + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0))), height: Math.max(280, Math.min(1600, current.height + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0))) }));
        }
      }}><MoveDiagonal2 /></Button>
  </section>;
}
