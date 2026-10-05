/** Abstracts the development, build, and preview engine. */
export interface BuildEngine { dev(): Promise<void>; build(): Promise<void>; preview(): Promise<void>; }
