/** Provides safe defaults for project configuration. */
import type { RdocserConfig } from "./RdocserConfig";
import { ConfigValidator } from "./ConfigValidator";
export class ConfigLoader { load(partial: Partial<RdocserConfig> = {}): RdocserConfig { const config: RdocserConfig = { docsDir:"docs", base:"./", ...partial, graph:{enabled:true,physics:true,maxExpandedCards:5,...partial.graph}, search:{enabled:true,...partial.search} }; new ConfigValidator().validate(config); return config; } }
