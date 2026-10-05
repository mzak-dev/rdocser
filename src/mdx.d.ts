/** Declares compiled MDX modules without coupling generated metadata to React. */
declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXComponents } from "mdx/types";
  const Component: ComponentType<{ components?: MDXComponents }>;
  export default Component;
}
declare module "*.md" {
  import type { ComponentType } from "react";
  import type { MDXComponents } from "mdx/types";
  const Component: ComponentType<{ components?: MDXComponents }>;
  export default Component;
}
