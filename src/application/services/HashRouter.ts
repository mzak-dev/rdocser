/** Parses and formats GitHub Pages routes without server-side rewrites. */
export type ViewMode = "classic" | "graph";
export interface Route { mode: ViewMode; documentId: string; heading?: string; shared?: string; standalone?: boolean }
export class HashRouter {
  read(hash: string): Route {
    const [pathname, query = ""] = hash.replace(/^#/, "").split("?");
    const params = new URLSearchParams(query);
    if (pathname === "/graph") return { mode: "graph", documentId: params.get("document") ?? "", shared: params.get("state") ?? undefined };
    const match = pathname.match(/^\/(article|presentation|present)\/(.+)$/);
    try {
      return { mode: "classic", documentId: match ? decodeURIComponent(match[2]) : "", heading: params.get("heading") ?? undefined, standalone: match?.[1] === "present" };
    } catch { return { mode: "classic", documentId: "" }; }
  }
  document(id: string, type = "article", heading?: string) {
    return `#/${type}/${id.split("/").map(encodeURIComponent).join("/")}${heading ? `?heading=${encodeURIComponent(heading)}` : ""}`;
  }
  graph(id = "", shared?: string) {
    const params = new URLSearchParams();
    if (id) params.set("document", id);
    if (shared) params.set("state", shared);
    return `#/graph${params.size ? `?${params}` : ""}`;
  }
}
