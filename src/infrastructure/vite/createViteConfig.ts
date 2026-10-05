/** Composes one client-only pipeline for repository scripts and installed CLI projects. */
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { DocumentManifestPlugin } from "./DocumentManifestPlugin";
import { ThemePlugin } from "./ThemePlugin";
export interface ViteProjectOptions { packageRoot: string; projectRoot: string; docsDir?: string; base?: string; outDir?: string; port?: number; host?: string; generateManifest?: boolean }
export function createViteConfig(options: ViteProjectOptions) {
  return defineConfig({
    root: options.packageRoot,
    plugins: [
      new DocumentManifestPlugin(path.resolve(options.projectRoot, options.docsDir ?? "docs"), options.generateManifest ?? false).plugin(),
      new ThemePlugin(path.resolve(options.projectRoot, "theme.json")).plugin(),
      mdx({ include: /\.(md|mdx)$/i, remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] }), react(), tailwindcss(),
    ],
    resolve: { alias: { "@": path.join(options.packageRoot, "src") }, dedupe: ["react", "react-dom"] },
    base: options.base ?? "./",
    build: { outDir: path.resolve(options.projectRoot, options.outDir ?? "dist"), emptyOutDir: false },
    server: { host: options.host ?? "localhost", port: options.port ?? 5173, strictPort: true, fs: { allow: [options.packageRoot, options.projectRoot] } },
    preview: { host: options.host ?? "localhost", port: options.port ?? 4173, strictPort: true },
  });
}
