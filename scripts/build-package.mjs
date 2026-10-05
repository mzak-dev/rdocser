import { build } from "esbuild";
import { mkdir, copyFile } from "node:fs/promises";
await mkdir("package-dist", { recursive: true });
await build({
  entryPoints: { cli: "src/cli/main.ts", vite: "src/package.ts", "init-wizard": "src/cli/ui/InitWizard.ts" },
  bundle: true, splitting: true, platform: "node", format: "esm", packages: "external",
  outdir: "package-dist", outExtension: { ".js": ".mjs" },
});
await copyFile("src/package.d.ts", "package-dist/vite.d.ts");
