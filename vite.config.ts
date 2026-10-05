/** Builds the repository through the same client-only pipeline as the public CLI. */
import { fileURLToPath } from "node:url";
import { createViteConfig } from "./src/infrastructure/vite/createViteConfig";
const root = fileURLToPath(new URL(".", import.meta.url));
export default createViteConfig({ packageRoot: root, projectRoot: root, docsDir: process.env.RDOCSER_DOCS_DIR ?? "docs", generateManifest: true });
