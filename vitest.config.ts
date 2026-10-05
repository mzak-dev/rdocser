/** Runs logic and DOM integration checks separately from optional browser acceptance tests. */
import { defineConfig } from "vitest/config";
import { createViteConfig } from "./src/infrastructure/vite/createViteConfig";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({ ...createViteConfig({ packageRoot: root, projectRoot: root }), test: { include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"], environment: "node", setupFiles: ["./tests/setup.ts"] } });
