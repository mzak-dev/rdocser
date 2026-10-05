/** Verifies initialization creates a usable project and protects existing author files. */
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { InitCommand } from "../../src/cli/commands/InitCommand";

it("creates MDX and theme files without overwriting existing content", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-init-"));
  try {
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "docs/welcome.mdx"), "# My existing document");
    await new InitCommand().execute(root);
    expect(await readFile(path.join(root, "docs/welcome.mdx"), "utf8")).toBe("# My existing document");
    expect(JSON.parse(await readFile(path.join(root, "rdocser.config.json"), "utf8"))).toMatchObject({ docsDir: "docs", base: "./" });
    expect(JSON.parse(await readFile(path.join(root, "theme.json"), "utf8"))).toHaveProperty("colors.primary");
  } finally { await rm(root, { recursive: true, force: true }); }
});

it("copies a logo and saves the selected light/dark palette while preserving existing configuration", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-brand-"));
  try {
    const logo = '<svg xmlns="http://www.w3.org/2000/svg"/>';
    await writeFile(path.join(root, "custom.svg"), logo);
    await new InitCommand().execute(root, "knowledge", { name: "Acme", logo: "custom.svg", theme: "violet" });
    const themePath = path.join(root, "theme.json");
    const before = await readFile(themePath, "utf8");
    expect(JSON.parse(before)).toMatchObject({ branding: { name: "Acme", logo: "./branding/logo.svg" }, colors: { primary: "#7542b8" }, darkColors: { primary: "#d3b0ff" } });
    expect(await readFile(path.join(root, "branding/logo.svg"), "utf8")).toBe(logo);
    await new InitCommand().execute(root, "knowledge", { name: "Other", logo: "does-not-exist.svg", theme: "ocean" });
    expect(await readFile(themePath, "utf8")).toBe(before);
  } finally { await rm(root, { recursive: true, force: true }); }
});

it("rejects invalid logos before creating project files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "rdocser-invalid-"));
  try {
    await expect(new InitCommand().execute(root, "docs", { logo: "script.js" })).rejects.toThrow("logo must be");
    await expect(readFile(path.join(root, "rdocser.config.json"))).rejects.toMatchObject({ code: "ENOENT" });
  } finally { await rm(root, { recursive: true, force: true }); }
});
