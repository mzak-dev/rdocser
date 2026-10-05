/** Executes the headless build command through the build port. */
import type { BuildEngine } from "../../application/ports/BuildEngine";
export class BuildCommand { constructor(private readonly engine: BuildEngine) {} async execute() { await this.engine.build(); } }

