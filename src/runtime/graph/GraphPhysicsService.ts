/** Owns the physics worker, interaction pauses and subscription lifecycle. */
export interface PhysicsNode { id: string; x: number; y: number; width: number; height: number; pinned?: boolean; anchorX?: number; anchorY?: number }
export interface NodePosition { id: string; x: number; y: number }
export interface NodeSize { width: number; height: number }
export type PhysicsMessage = { type: "initialize"; nodes: PhysicsNode[]; edges: { source: string; target: string }[] } | { type: "pause" | "resume" } | { type: "update"; nodes: PhysicsNode[] };
export class GraphPhysicsService {
  private worker?: Worker;
  private readonly listeners = new Set<(positions: NodePosition[]) => void>();
  private readonly pauses = new Set<string>();
  start(nodes: PhysicsNode[], edges: { source: string; target: string }[]) {
    this.stop();
    this.worker = new Worker(new URL("./GraphPhysicsWorker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (event: MessageEvent<NodePosition[]>) => this.listeners.forEach(listener => listener(event.data));
    this.worker.postMessage({ type: "initialize", nodes, edges } satisfies PhysicsMessage);
    this.syncPause();
  }
  pause(reason = "manual") { this.pauses.add(reason); this.syncPause(); }
  resume(reason = "manual") { this.pauses.delete(reason); this.syncPause(); }
  update(nodes: PhysicsNode[]) { this.worker?.postMessage({ type: "update", nodes } satisfies PhysicsMessage); }
  subscribe(listener: (positions: NodePosition[]) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  stop() { this.worker?.terminate(); this.worker = undefined; }
  private syncPause() { this.worker?.postMessage({ type: this.pauses.size ? "pause" : "resume" } satisfies PhysicsMessage); }
}
