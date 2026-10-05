/** Lazy graph route boundary, keeping React Flow and physics out of the initial reader bundle. */
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentManifestEntry } from "../../domain/documents/DocumentManifest";
const DocumentGraph = lazy(() => import("../graph/DocumentGraph").then(module => ({ default: module.DocumentGraph })));
export function GraphLayout({ documents, activeId, shared, onRead }: { documents: DocumentManifestEntry[]; activeId?: string; shared?: string; onRead: (id: string) => void }) {
  return <Suspense fallback={<Skeleton className="h-full w-full" />}><DocumentGraph key={shared ?? "local"} documents={documents} activeId={activeId} shared={shared} onRead={onRead} /></Suspense>;
}
