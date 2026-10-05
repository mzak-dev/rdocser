/** Executes the headless serve command through the build port. */
import type { BuildEngine } from "../../application/ports/BuildEngine";
export class ServeCommand { constructor(private readonly engine: BuildEngine) {} async execute() { await this.engine.preview(); } }

