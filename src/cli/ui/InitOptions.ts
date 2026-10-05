import type { ThemeConfig } from "../../config/ThemeConfig";

export const themePresets = {
  forest: { primary: "#35624d", darkPrimary: "#94d7b3" },
  ocean: { primary: "#245bbb", darkPrimary: "#93bdff" },
  violet: { primary: "#7542b8", darkPrimary: "#d3b0ff" },
} as const;
export type ThemePreset = keyof typeof themePresets;
export interface InitOptions { name?: string; logo?: string; theme?: ThemePreset }

export function createInitialTheme(options: InitOptions = {}): ThemeConfig {
  const preset = themePresets[options.theme ?? "forest"];
  if (!preset) throw new Error("theme must be forest, ocean or violet");
  if (options.name !== undefined && !options.name.trim()) throw new Error("name must not be empty");
  return {
    branding: { name: options.name?.trim() ?? "Rdocser", ...(options.logo ? { logo: options.logo } : {}) },
    colors: { background: "#fafaf9", foreground: "#202321", primary: preset.primary, muted: "#6e746f", card: "#ffffff" },
    darkColors: { primary: preset.darkPrimary }, radius: "0.625rem", animation: true,
  };
}
