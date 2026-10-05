/** OpenTUI is loaded only for interactive init; other commands need no native FFI. */
import { BoxRenderable, TextRenderable, InputRenderable, SelectRenderable, createCliRenderer, type KeyEvent, type CliRenderer } from "@opentui/core";
import { themePresets, type InitOptions, type ThemePreset } from "./InitOptions";

export async function runInitWizard(defaults: InitOptions = {}, createRenderer: () => Promise<CliRenderer> = () => createCliRenderer({ exitOnCtrlC: false })): Promise<InitOptions | undefined> {
  const renderer = await createRenderer();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (value?: InitOptions) => {
      if (settled) return;
      settled = true;
      renderer.destroy();
      resolve(value);
    };
    try {
      const panel = new BoxRenderable(renderer, { padding: 2, gap: 1, flexDirection: "column", width: "100%" });
      panel.add(new TextRenderable(renderer, { content: "rdocser.  /  Set up your documentation", fg: "#94d7b3" }));
      const label = new TextRenderable(renderer, { content: "1/3  Project name — Enter to continue" });
      const input = new InputRenderable(renderer, { value: defaults.name ?? "Rdocser", width: "100%", maxLength: 1024 });
      const palette = new SelectRenderable(renderer, {
        visible: false, height: 7, width: "100%", selectedIndex: Object.keys(themePresets).indexOf(defaults.theme ?? "forest"),
        options: Object.keys(themePresets).map(value => ({ name: value, description: `Light + dark palette · ${themePresets[value as ThemePreset].primary}`, value })),
      });
      const preview = new TextRenderable(renderer, { content: "", fg: "#94d7b3" });
      panel.add(label); panel.add(input); panel.add(palette); panel.add(preview);
      panel.add(new TextRenderable(renderer, { content: "Enter: continue / save  ·  ↑↓: palette  ·  Esc or Ctrl+C: cancel" }));
      renderer.root.add(panel);
      const result: InitOptions = { ...defaults };
      let step = 0;
      input.on("enter", () => {
        if (step === 0) {
          if (!input.value.trim()) { label.content = "Project name cannot be empty"; return; }
          result.name = input.value.trim();
          step = 1;
          label.content = "2/3  Logo file relative to project root (blank = default logo)";
          input.value = defaults.logo ?? "";
          input.placeholder = "./assets/logo.svg";
        } else {
          result.logo = input.value.trim() || undefined;
          step = 2;
          input.blur(); input.visible = false;
          palette.visible = true; palette.focus();
          label.content = "3/3  Choose theme — Enter to save";
          preview.content = `${result.name} · ${result.logo ?? "default logo"}`;
        }
      });
      palette.on("selectionChanged", () => {
        const theme = palette.getSelectedOption()?.value as ThemePreset;
        preview.fg = themePresets[theme].darkPrimary;
        preview.content = `${result.name} · ${result.logo ?? "default logo"} · ${theme}`;
      });
      palette.on("itemSelected", () => { result.theme = palette.getSelectedOption()?.value as ThemePreset; finish(result); });
      renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (key.name === "escape" || (key.ctrl && key.name === "c")) finish();
      });
      renderer.once("destroy", () => { if (!settled) { settled = true; resolve(undefined); } });
      input.focus();
    } catch (error) {
      settled = true;
      renderer.destroy();
      reject(error);
    }
  });
}
