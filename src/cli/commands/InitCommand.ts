/** Creates a minimal author project using exclusive writes to protect existing files. */
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { createInitialTheme, type InitOptions } from "../ui/InitOptions";
export class InitCommand {
  async execute(root: string, docsDir = "docs", options: InitOptions = {}): Promise<void> {
    const theme = createInitialTheme(options);
    let logo: Buffer | undefined;
    const extension = options.logo ? path.extname(options.logo).toLowerCase() : "";
    let themeExists = false;
    try { await access(path.join(root, "theme.json")); themeExists = true; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (options.logo && !themeExists) {
      if (![".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension)) throw new Error("logo must be an SVG, PNG, JPEG, WebP or GIF file");
      logo = await readFile(path.resolve(root, options.logo));
      if (logo.length > 2 * 1024 * 1024) throw new Error("logo must be smaller than 2 MB");
      theme.branding!.logo = `./branding/logo${extension}`;
    }
    const destination = path.resolve(root, docsDir);
    await mkdir(destination, { recursive: true });
    const writeNew = async (filename: string, content: string) => {
      try { await writeFile(filename, content, { encoding: "utf8", flag: "wx" }); return true; }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; return false; }
    };
    await writeNew(path.join(root, "rdocser.config.json"), JSON.stringify({ docsDir, base: "./", outDir: "dist" }, null, 2) + "\n");
    if (logo) {
      await mkdir(path.join(root, "branding"), { recursive: true });
      // Never silently point new configuration at somebody else's existing logo.
      await writeFile(path.join(root, `branding/logo${extension}`), logo, { flag: "wx" });
    }
    await writeNew(path.join(root, "theme.json"), JSON.stringify(theme, null, 2) + "\n");
    await writeNew(path.join(destination, "welcome.mdx"), "---\ntitle: Welcome\ngroup: Getting started\norder: 1\n---\n\n# Welcome\n\nYour documentation workspace is ready. Add Markdown or MDX files here and connect your ideas.\n");
  }
}
