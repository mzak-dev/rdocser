/** Bundled CLI entry, with package location supplied by the executable wrapper. */
import { RdocserCli } from "./RdocserCli";
export async function main(packageRoot: string, args = process.argv.slice(2)) { await new RdocserCli(packageRoot).run(args); }
