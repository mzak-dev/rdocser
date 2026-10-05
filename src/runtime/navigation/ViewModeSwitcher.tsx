/** Accessible, keyboard-operable selection between reading and graph exploration. */
import { BookOpen, Network } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ViewMode } from "../../application/services/HashRouter";
export function ViewModeSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return <ToggleGroup type="single" value={mode} onValueChange={value => { if (value === "classic" || value === "graph") onChange(value); }} variant="outline" size="sm" spacing={0} aria-label="Document view">
    <ToggleGroupItem value="classic" aria-label="Classic view"><BookOpen /><span>Read</span></ToggleGroupItem>
    <ToggleGroupItem value="graph" aria-label="Graph view"><Network /><span>Explore</span></ToggleGroupItem>
  </ToggleGroup>;
}
