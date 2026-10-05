/** Builds a separate author project through the real adapter without modifying installed sources. */
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { ViteBuildEngine } from "../../src/infrastructure/vite/ViteBuildEngine";
it("compiles an external source directory into lazy SPA assets", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-build-"));
  const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
  const manifestPath = path.join(packageRoot, "src/generated/document-manifest.ts");
  const before = await readFile(manifestPath, "utf8");
  try {
    await mkdir(path.join(root, "knowledge"));
    await writeFile(path.join(root, "knowledge/unique.mdx"), "---\ntitle: External knowledge\n---\n# External knowledge\n\nA uniquely authored insight.\n");
    await new ViteBuildEngine({ packageRoot, projectRoot: root, docsDir: "knowledge" }).build();
    expect(await readFile(path.join(root, "dist/index.html"), "utf8")).toContain("./assets/");
    const names = await readdir(path.join(root, "dist/assets"));
    const content = names.find(name => /^unique-.*\.js$/.test(name));
    expect(content).toBeTruthy();
    expect(await readFile(path.join(root, "dist/assets", content!), "utf8")).toContain("A uniquely authored insight.");
    expect(await readFile(manifestPath, "utf8")).toBe(before);
  } finally { await rm(root, { recursive: true, force: true }); }
}, 30000);
