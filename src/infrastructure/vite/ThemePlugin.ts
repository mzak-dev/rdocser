/** Loads the consuming project's theme without modifying package-installed sources. */
import path from "node:path";
import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import type { ThemeConfig } from "../../config/ThemeConfig";
import { ThemeService } from "../../application/services/ThemeService";
export class ThemePlugin {
  constructor(private readonly filename: string) {}
  plugin(): Plugin {
    const filename = path.resolve(this.filename);
    const virtualId = "\0virtual:rdocser/theme";
    let logoFilename: string | undefined;
    return {
      name: "rdocser-theme",
      resolveId(id) { if (id === "virtual:rdocser/theme") return virtualId; },
      async load(id) {
        if (id !== virtualId) return;
        let theme: unknown = {};
        try { theme = JSON.parse(await readFile(filename, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
        if (!theme || typeof theme !== "object" || Array.isArray(theme)) throw new Error("theme.json must contain an object");
        const resolved = new ThemeService().resolve(theme as ThemeConfig);
        logoFilename = undefined;
        if (resolved.branding?.logo) {
          const logo = resolved.branding.logo;
          if (/^(https?:|data:)/i.test(logo)) throw new Error("theme.branding.logo must be a local image path");
          logoFilename = path.resolve(path.dirname(filename), logo);
          const mime = ({ ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" } as Record<string, string>)[path.extname(logoFilename).toLowerCase()];
          if (!mime) throw new Error("theme.branding.logo must be an SVG, PNG, JPEG, WebP or GIF file");
          const bytes = await readFile(logoFilename);
          if (bytes.length > 2 * 1024 * 1024) throw new Error("theme.branding.logo must be smaller than 2 MB");
          this.addWatchFile(logoFilename);
          resolved.branding = { ...resolved.branding, logo: `data:${mime};base64,${bytes.toString("base64")}` };
        }
        return `export default ${JSON.stringify(resolved)};`;
      },
      configureServer(server) {
        server.watcher.add(filename);
        const change = (updated: string) => { if ([filename, logoFilename].includes(path.resolve(updated))) { const module = server.moduleGraph.getModuleById(virtualId); if (module) server.moduleGraph.invalidateModule(module); server.ws.send({ type: "full-reload" }); } };
        server.watcher.on("change", change);
        server.watcher.on("add", change);
        server.watcher.on("unlink", change);
        server.httpServer?.once("close", () => { server.watcher.off("change", change); server.watcher.off("add", change); server.watcher.off("unlink", change); });
      },
    };
  }
}
