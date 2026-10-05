/** Executes the headless dev command through the build port. */
import type { BuildEngine } from "../../application/ports/BuildEngine";
export class DevCommand { constructor(private readonly engine: BuildEngine) {} async execute() { await this.engine.dev(); } }

