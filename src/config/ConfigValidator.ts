/** Validates user configuration at the application boundary. */
import type { RdocserConfig } from "./RdocserConfig";
export class ConfigValidator { validate(value: RdocserConfig): void { if (!value.docsDir) throw new Error("docsDir is required"); if (value.graph.maxExpandedCards < 1) throw new Error("maxExpandedCards must be positive"); } }
