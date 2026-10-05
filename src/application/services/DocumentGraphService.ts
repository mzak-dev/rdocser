/** Produces deterministic graph projections independently of React and layout physics. */
import type { Document } from "../../domain/documents/Document";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
import type { GraphNode } from "../../domain/graph/GraphNode";
import type { GraphEdge } from "../../domain/graph/GraphEdge";
type ProjectionDocument = Pick<DocumentManifestEntry, "id" | "title" | "type" | "relations">;
export class DocumentGraphService {
  buildGraph(documents: Document[]) { return this.project(documents.map(doc => ({ id: doc.slug, title: doc.title, type: doc.type, relations: doc.relations }))); }
  buildManifestGraph(documents: DocumentManifestEntry[]) { return this.project(documents); }
  private project(documents: ProjectionDocument[]) {
    const ids = new Set(documents.map(doc => doc.id));
    const nodes: GraphNode[] = documents.map((doc, index) => ({ id: doc.id, label: doc.title, type: doc.type, x: index % 5 * 340, y: Math.floor(index / 5) * 260, width: 280, height: 184 }));
    const edges = new Map<string, GraphEdge>();
    for (const doc of documents) for (const relation of doc.relations) {
      if (!ids.has(relation.target) || relation.target === doc.id) continue;
      const id = `${doc.id}:${relation.target}:${relation.kind}`;
      edges.set(id, { id, source: doc.id, target: relation.target, label: relation.kind });
    }
    return { nodes, edges: [...edges.values()] };
  }
}

