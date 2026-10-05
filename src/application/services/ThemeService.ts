/** Resolves minimal theme tokens into a coherent shadcn palette. */
import type { ThemeConfig } from "../../config/ThemeConfig";
export class ThemeService {
  variables(theme: ThemeConfig, mode: "light" | "dark" = "light"): Record<string, string> {
    this.resolve(theme);
    const colors: Record<string, string> = mode === "dark" ? {
      background: "#121816", foreground: "#e5ece7", card: "#1a221e", primary: "#94d7b3",
      "primary-foreground": "#12271c", muted: "#a3b2a8", ...theme.darkColors,
    } : theme.colors ?? {};
    const background = colors.background ?? "#fafaf9";
    const foreground = colors.foreground ?? "#202321";
    const primary = colors.primary ?? "#35624d";
    const muted = colors.muted ?? "#6e746f";
    return {
      "--background": background, "--foreground": foreground, "--primary": primary, "--primary-foreground": colors["primary-foreground"] ?? "#ffffff",
      "--card": colors.card ?? background, "--card-foreground": foreground, "--popover": background, "--popover-foreground": foreground,
      "--muted": `color-mix(in srgb, ${background}, ${foreground} 4%)`, "--muted-foreground": muted,
      "--secondary": `color-mix(in srgb, ${background}, ${foreground} 6%)`, "--secondary-foreground": foreground,
      "--accent": `color-mix(in srgb, ${background}, ${primary} 9%)`, "--accent-foreground": primary,
      "--border": `color-mix(in srgb, ${background}, ${foreground} 12%)`, "--input": `color-mix(in srgb, ${background}, ${foreground} 16%)`,
      "--ring": primary, "--destructive": mode === "dark" ? "#ffaaa1" : "#b23d37", "--radius": theme.radius ?? "0.625rem",
      "--font-sans": theme.fonts?.sans ?? "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
      "--font-mono": theme.fonts?.mono ?? "ui-monospace, SFMono-Regular, Consolas, monospace",
    };
  }
  resolve(theme: ThemeConfig): ThemeConfig {
    if (theme.branding !== undefined) {
      if (!theme.branding || typeof theme.branding !== "object" || Array.isArray(theme.branding)) throw new Error("theme.branding must contain an object");
      for (const key of ["name", "logo"] as const) {
        if (theme.branding[key] !== undefined && (typeof theme.branding[key] !== "string" || !theme.branding[key]?.trim())) throw new Error(`theme.branding.${key} must be a non-empty string`);
      }
    }
    for (const key of ["colors", "darkColors", "fonts"] as const) {
      const tokens = theme[key];
      if (tokens !== undefined && (!tokens || typeof tokens !== "object" || Array.isArray(tokens) || Object.values(tokens).some(value => typeof value !== "string" || !value.trim()))) throw new Error(`theme.${key} must contain non-empty string tokens`);
    }
    if (theme.animation !== undefined && typeof theme.animation !== "boolean") throw new Error("theme.animation must be a boolean");
    if (theme.radius !== undefined && (typeof theme.radius !== "string" || !theme.radius.trim())) throw new Error("theme.radius must be a CSS length string");
    return { animation: true, ...theme };
  }
}
