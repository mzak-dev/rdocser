/** Public configuration model for an Rdocser project. */
export interface RdocserConfig { docsDir: string; base: string; theme?: string; graph: { enabled: boolean; physics: boolean; maxExpandedCards: number }; search: { enabled: boolean }; }
