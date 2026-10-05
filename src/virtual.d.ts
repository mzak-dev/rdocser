/** Typed contracts for build-provided content and project theme modules. */
declare module "virtual:rdocser/documents" {
  import type { DocumentManifestEntry } from "./domain/documents/DocumentManifest";
  import type { ComponentType } from "react";
  import type { MDXComponents } from "mdx/types";
  export const documentManifest: DocumentManifestEntry[];
  export const documentLoaders: Record<string, () => Promise<{ default: ComponentType<{ components?: MDXComponents }> }>>;
}
declare module "virtual:rdocser/theme" {
  import type { ThemeConfig } from "./config/ThemeConfig";
  const theme: ThemeConfig;
  export default theme;
}
