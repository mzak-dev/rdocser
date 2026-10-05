/** Executes dev/build/preview against the Rdocser shell and consuming project's content. */
import { build, createServer, preview, type ViteDevServer, type PreviewServer } from "vite";
import type { BuildEngine } from "../../application/ports/BuildEngine";
import { createViteConfig, type ViteProjectOptions } from "./createViteConfig";
export class ViteBuildEngine implements BuildEngine {
  private server?: ViteDevServer | PreviewServer;
  constructor(private readonly options: ViteProjectOptions) {}
  async dev() { const server = await createServer({ ...createViteConfig(this.options), configFile: false }); this.server = server; await server.listen(); server.printUrls(); this.installShutdown(); }
  async build() { await build({ ...createViteConfig(this.options), configFile: false }); }
  async preview() { const server = await preview({ ...createViteConfig(this.options), configFile: false }); this.server = server; server.printUrls(); this.installShutdown(); }
  private installShutdown() {
    const shutdown = async () => { await this.server?.close(); process.exit(0); };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }
}
