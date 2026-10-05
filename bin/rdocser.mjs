#!/usr/bin/env node
/** Runs the packaged CLI and reports failures without interactive prompts. */
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const args = process.argv.slice(2);
const interactive = args[0] === "init" && !args.includes("--yes") && !args.includes("--help") && !args.includes("-h") && process.stdin.isTTY && process.stdout.isTTY;
const [major, minor] = process.versions.node.split(".").map(Number);
if (interactive && (major > 26 || (major === 26 && minor >= 4)) && !process.execArgv.includes("--experimental-ffi") && !process.env.NODE_OPTIONS?.includes("--experimental-ffi")) {
  const child = spawn(process.execPath, [...process.execArgv, "--experimental-ffi", fileURLToPath(import.meta.url), ...args], { stdio: "inherit" });
  child.on("error", error => { console.error(`[rdocser] ${error.message}`); process.exitCode = 1; });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
try { const { main } = await import("../package-dist/cli.mjs"); await main(fileURLToPath(new URL("../", import.meta.url))); }
catch (error) { console.error(`[rdocser] ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}

