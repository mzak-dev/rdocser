/** Serializable content projections shared by build adapters and the browser. */
import type { DocumentRelation } from "../graph/DocumentRelation";
import type { DocumentType } from "./DocumentType";

export interface DocumentHeading { id: string; title: string; level: number }
export interface DocumentManifestEntry {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  group: string;
  order: number;
  sourcePath: string;
  headings: DocumentHeading[];
  relations: DocumentRelation[];
  text: string;
  readingMinutes: number;
}
