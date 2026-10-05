/** Runs source CLI commands during development without rebuilding the package. */
import { fileURLToPath } from "node:url";
import { main } from "./main";
try { await main(fileURLToPath(new URL("../../", import.meta.url))); }
catch (error) { console.error(`[rdocser] ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
