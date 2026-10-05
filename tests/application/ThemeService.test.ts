/** Validates coherent theme derivation and rejects malformed JSON tokens. */
import { expect, it } from "vitest";
import { ThemeService } from "../../src/application/services/ThemeService";
import type { ThemeConfig } from "../../src/config/ThemeConfig";
it("derives reader, dialog and graph surfaces from the same theme", () => {
  const variables = new ThemeService().variables({ colors: { background: "#101010", foreground: "#f0f0f0", primary: "#aabbcc" }, animation: false });
  expect(variables["--popover"]).toBe("#101010");
  expect(variables["--card-foreground"]).toBe("#f0f0f0");
  expect(variables["--accent"]).toContain("#aabbcc");
  expect(new ThemeService().resolve({ animation: false }).animation).toBe(false);
});
it("rejects non-string color tokens with an actionable error", () => {
  expect(() => new ThemeService().resolve({ colors: { primary: 123 } } as unknown as ThemeConfig)).toThrow("theme.colors must contain non-empty string tokens");
});

it("uses a dedicated dark palette and allows project dark overrides", () => {
  const service = new ThemeService();
  const theme = { colors: { background: "#ffffff", foreground: "#111111" }, darkColors: { primary: "#b6e3cc" } };
  const dark = service.variables(theme, "dark");
  expect(dark["--background"]).toBe("#121816");
  expect(dark["--foreground"]).toBe("#e5ece7");
  expect(dark["--primary"]).toBe("#b6e3cc");
  expect(service.variables(theme, "light")["--background"]).toBe("#ffffff");
});
