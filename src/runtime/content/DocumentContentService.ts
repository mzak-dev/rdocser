/** Caches lazy MDX component identities so moving graph cards preserves local state. */
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { MDXComponents } from "mdx/types";
import { documentLoaders } from "virtual:rdocser/documents";
type ContentComponent = ComponentType<{ components?: MDXComponents }>;
export class DocumentContentService {
  private readonly components = new Map<string, LazyExoticComponent<ContentComponent>>();
  get(id: string) {
    const loader = documentLoaders[id as keyof typeof documentLoaders];
    if (!loader) return undefined;
    let component = this.components.get(id);
    if (!component) { component = lazy(loader); this.components.set(id, component); }
    return component;
  }
}
export const documentContentService = new DocumentContentService();

