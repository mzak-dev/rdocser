import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "../context/ThemeRuntimeContext";
export function ThemeSwitcher() {
  const { preference, colorMode, setPreference } = useTheme();
  const next = preference === "system" ? "dark" : preference === "dark" ? "light" : "system";
  const label = `Theme: ${preference}. Switch to ${next}`;
  return <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={label} onClick={() => setPreference(next)}>
    {preference === "system" ? <Monitor /> : colorMode === "dark" ? <Moon /> : <Sun />}
  </Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}
