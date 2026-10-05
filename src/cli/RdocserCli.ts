/** Parses headless commands and delegates project lifecycle to a build adapter. */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { ViteBuildEngine } from "../infrastructure/vite/ViteBuildEngine";
import { InitCommand } from "./commands/InitCommand";
import { BuildCommand } from "./commands/BuildCommand";
import { DevCommand } from "./commands/DevCommand";
import { PreviewCommand } from "./commands/PreviewCommand";
import { ServeCommand } from "./commands/ServeCommand";
import { CliReporter } from "./ui/CliReporter";
import { themePresets, type InitOptions, type ThemePreset } from "./ui/InitOptions";
interface ProjectConfig { docsDir?: string; base?: string; outDir?: string }
export class RdocserCli {
  constructor(private readonly packageRoot: string, private readonly reporter = new CliReporter()) {}
  async run(args: string[]): Promise<void> {
    if (!args.length || args.includes("--help") || args.includes("-h")) {
      this.reporter.info("Usage: rdocser <init|dev|build|serve|preview> [--root path] [--docs-dir path] [--base path] [--out-dir path] [--port number] [--host hostname]\nInit: [--yes] [--name text] [--logo file] [--theme forest|ocean|violet]\nInteractive init requires Node >=26.4.0; the executable enables --experimental-ffi automatically.");
      return;
    }
    if (args[0] === "--version") { this.reporter.info("0.1.0"); return; }
    const command = args[0];
    if (!["init", "dev", "build", "serve", "preview"].includes(command)) throw new Error(`Unknown command: ${command}. Use --help.`);
    const options: Record<string, string> = {};
    const allowed = new Set(["--root", "--docs-dir", "--base", "--out-dir", "--port", "--host", ...(command === "init" ? ["--name", "--logo", "--theme"] : [])]);
    let yes = false;
    for (let index = 1; index < args.length; index++) {
      const flag = args[index];
      if (command === "init" && flag === "--yes") { yes = true; continue; }
      const value = args[++index];
      if (!allowed.has(flag) || !value || value.startsWith("--")) throw new Error(`Invalid option: ${flag}. Options require a value.`);
      options[flag] = value;
    }
    const root = path.resolve(options["--root"] ?? process.cwd());
    if (command === "init") {
      if (options["--theme"] && !Object.hasOwn(themePresets, options["--theme"])) throw new Error("theme must be forest, ocean or violet");
      let setup: InitOptions = { name: options["--name"], logo: options["--logo"], theme: options["--theme"] as ThemePreset | undefined };
      if (!yes && process.stdin.isTTY && process.stdout.isTTY) {
        const [major, minor] = process.versions.node.split(".").map(Number);
        if (major < 26 || (major === 26 && minor < 4)) throw new Error("Interactive init requires Node >=26.4.0. Upgrade Node or use init --yes.");
        const { runInitWizard } = await import("./ui/InitWizard");
        const selected = await runInitWizard(setup);
        if (!selected) { this.reporter.info("Initialization cancelled."); return; }
        setup = selected;
      }
      await new InitCommand().execute(root, options["--docs-dir"] ?? "docs", setup);
      this.reporter.info(`Project ready in ${root}. Existing files were preserved.\nNext: rdocser dev --root "${root}"`);
      return;
    }
    let config: ProjectConfig = {};
    try { config = JSON.parse(await readFile(path.join(root, "rdocser.config.json"), "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("rdocser.config.json must contain an object");
    for (const key of ["docsDir", "base", "outDir"] as const) if (config[key] !== undefined && (typeof config[key] !== "string" || !config[key]?.trim())) throw new Error(`${key} must be a non-empty string`);
    const port = options["--port"] === undefined ? undefined : Number(options["--port"]);
    if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) throw new Error("port must be an integer between 1 and 65535");
    const engine = new ViteBuildEngine({ packageRoot: this.packageRoot, projectRoot: root, docsDir: options["--docs-dir"] ?? config.docsDir ?? "docs", base: options["--base"] ?? config.base ?? "./", outDir: options["--out-dir"] ?? config.outDir ?? "dist", port, host: options["--host"] });
    const commands = { dev: new DevCommand(engine), build: new BuildCommand(engine), preview: new PreviewCommand(engine), serve: new ServeCommand(engine) };
    await commands[command as keyof typeof commands].execute();
  }
}
