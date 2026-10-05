import type { UserConfig } from "vite";
export interface ViteProjectOptions {
  packageRoot: string; projectRoot: string; docsDir?: string; base?: string;
  outDir?: string; port?: number; host?: string; generateManifest?: boolean;
}
export interface ThemeConfig {
  branding?: { name?: string; logo?: string };
  colors?: Record<string, string>; darkColors?: Record<string, string>;
  fonts?: Record<string, string>; radius?: string; animation?: boolean;
}
export function createViteConfig(options: ViteProjectOptions): UserConfig;
