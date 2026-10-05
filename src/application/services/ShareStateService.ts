/** Validates and encodes bounded, versioned graph state for shareable hash links. */
export interface GraphViewState {
  version: 1;
  open: string[];
  camera: { x: number; y: number; zoom: number };
  positions: Record<string, { x: number; y: number }>;
  anchors?: Record<string, { x: number; y: number }>;
  sizes: Record<string, { width: number; height: number }>;
}
export class ShareStateService {
  encode(state: GraphViewState) {
    const encoded = btoa(encodeURIComponent(JSON.stringify(state))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
    if (encoded.length > 64000) throw new Error("This graph is too large to share in a URL.");
    return encoded;
  }
  decode(value: string): GraphViewState | null {
    if (value.length > 64000) return null;
    try {
      const state = JSON.parse(decodeURIComponent(atob(value.replaceAll("-", "+").replaceAll("_", "/"))));
      const record = (input: unknown): input is Record<string, unknown> => !!input && typeof input === "object" && !Array.isArray(input);
      const finite = (input: unknown) => typeof input === "number" && Number.isFinite(input) && Math.abs(input) <= 1000000;
      if (!record(state) || state.version !== 1 || !Array.isArray(state.open) || state.open.length > 5 || !state.open.every(id => typeof id === "string" && id.length < 500)) return null;
      if (!record(state.camera) || !finite(state.camera.x) || !finite(state.camera.y) || typeof state.camera.zoom !== "number" || state.camera.zoom < 0.1 || state.camera.zoom > 4) return null;
      if (!record(state.sizes) || !record(state.positions) || Object.keys(state.sizes).length > 500 || Object.keys(state.positions).length > 500) return null;
      for (const [key, size] of Object.entries(state.sizes)) {
        if (["__proto__", "constructor", "prototype"].includes(key) || !record(size) || typeof size.width !== "number" || typeof size.height !== "number" || size.width < 240 || size.width > 1600 || size.height < 120 || size.height > 1600) return null;
      }
      for (const [key, position] of Object.entries(state.positions)) {
        if (["__proto__", "constructor", "prototype"].includes(key) || !record(position) || !finite(position.x) || !finite(position.y)) return null;
      }
      if (state.anchors !== undefined) {
        if (!record(state.anchors) || Object.keys(state.anchors).length > 500) return null;
        for (const [key, position] of Object.entries(state.anchors)) {
          if (["__proto__", "constructor", "prototype"].includes(key) || !record(position) || !finite(position.x) || !finite(position.y)) return null;
        }
      }
      return state as unknown as GraphViewState;
    } catch { return null; }
  }
}
