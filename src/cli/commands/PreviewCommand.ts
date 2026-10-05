/** Executes the headless preview command through the build port. */
import type { BuildEngine } from "../../application/ports/BuildEngine";
export class PreviewCommand { constructor(private readonly engine: BuildEngine) {} async execute() { await this.engine.preview(); } }

