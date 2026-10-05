/** Project tokens and the reader's persistent appearance preference. */
import { createContext, useContext } from "react";
import type { ThemeConfig } from "../../config/ThemeConfig";
export type ColorPreference = "system" | "light" | "dark";
export interface ThemeRuntime extends ThemeConfig {
  preference: ColorPreference;
  colorMode: "light" | "dark";
  setPreference: (preference: ColorPreference) => void;
}
export const ThemeRuntimeContext = createContext<ThemeRuntime>({ preference: "system", colorMode: "light", setPreference: () => {} });
export const useTheme = () => useContext(ThemeRuntimeContext);
