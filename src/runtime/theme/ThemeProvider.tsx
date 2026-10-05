/** Applies the palette to the root so portals, graph controls and documents agree. */
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import type { ThemeConfig } from "../../config/ThemeConfig";
import { ThemeService } from "../../application/services/ThemeService";
import { BrowserStorage } from "../../infrastructure/persistence/BrowserStorage";
import { ThemeRuntimeContext, type ColorPreference } from "../context/ThemeRuntimeContext";
const storage = new BrowserStorage();
export function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: ReactNode }) {
  const [preference, updatePreference] = useState<ColorPreference>(() => {
    const saved = storage.get<string>("rdocser:appearance");
    return saved === "light" || saved === "dark" ? saved : "system";
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const changed = () => setSystemDark(query.matches);
    changed(); query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  const colorMode = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables = new ThemeService().variables(theme, colorMode);
    for (const [key, value] of Object.entries(variables)) root.style.setProperty(key, value);
    root.classList.toggle("dark", colorMode === "dark");
    root.style.colorScheme = colorMode;
    root.dataset.animation = theme.animation === false ? "off" : "on";
    return () => {
      for (const key of Object.keys(variables)) root.style.removeProperty(key);
      root.classList.remove("dark"); root.style.removeProperty("color-scheme"); delete root.dataset.animation;
    };
  }, [theme, colorMode]);
  const setPreference = (value: ColorPreference) => { updatePreference(value); storage.set("rdocser:appearance", value); };
  return <ThemeRuntimeContext.Provider value={{ ...theme, preference, colorMode, setPreference }}>{children}</ThemeRuntimeContext.Provider>;
}
