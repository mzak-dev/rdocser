/** Minimal theme token model. */
export interface ThemeConfig { branding?: { name?: string; logo?: string }; colors?: Record<string,string>; darkColors?: Record<string,string>; fonts?: Record<string,string>; radius?: string; animation?: boolean; }
