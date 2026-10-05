/** Installs the actual tarball and builds an author project outside the package sources. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const repository = fileURLToPath(new URL("../", import.meta.url));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run this check through npm run test:package");
const run = (args, cwd) => {
  const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8", timeout: 180_000 });
  if (result.status !== 0) throw new Error(result.error?.message ?? result.stderr + result.stdout);
  return result.stdout;
};
const packed = JSON.parse(run([npm, "pack", "--json"], repository))[0];
const root = await mkdtemp(path.join(tmpdir(), "rdocser-package-"));
try {
  await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "rdocser-consumer", private: true, type: "module" }));
  run([npm, "install", path.join(repository, packed.filename), "--no-audit", "--no-fund"], root);
  const executable = path.join(root, "node_modules/rdocser/bin/rdocser.mjs");
  const cli = (...args) => run([executable, ...args], root);
  assert.match(cli("--help"), /--logo/);
  await mkdir(path.join(root, "assets"));
  const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="blue"/></svg>';
  await writeFile(path.join(root, "assets/logo.svg"), logo);
  cli("init", "--yes", "--name", "Acme Docs", "--logo", "./assets/logo.svg", "--theme", "ocean");
  const themePath = path.join(root, "theme.json");
  const before = await readFile(themePath, "utf8");
  assert.equal(JSON.parse(before).branding.name, "Acme Docs");
  assert.equal(JSON.parse(before).colors.primary, "#245bbb");
  cli("init", "--yes", "--theme", "violet");
  assert.equal(await readFile(themePath, "utf8"), before);
  cli("build");
  assert.match(await readFile(path.join(root, "dist/index.html"), "utf8"), /\.\/assets\//);
  const assets = await readdir(path.join(root, "dist/assets"));
  const scripts = await Promise.all(assets.filter(file => file.endsWith(".js")).map(file => readFile(path.join(root, "dist/assets", file), "utf8")));
  assert.ok(scripts.some(code => code.includes("Acme Docs") && code.includes(Buffer.from(logo).toString("base64"))));
  await writeFile(path.join(root, "api.mjs"), 'import { createViteConfig } from "rdocser/vite"; if (typeof createViteConfig !== "function") throw new Error("Missing Vite API");');
  run(["api.mjs"], root);
  console.log(`Package ${packed.filename}: installed CLI, branding assets, safe re-init, Vite API and production build passed.`);
} finally { await rm(root, { recursive: true, force: true }); }
