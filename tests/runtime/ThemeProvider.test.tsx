// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../src/runtime/theme/ThemeProvider";
import { useTheme } from "../../src/runtime/context/ThemeRuntimeContext";
function Controls() {
  const theme = useTheme();
  return <><span>{theme.colorMode}</span><button onClick={() => theme.setPreference("dark")}>Dark</button><button onClick={() => theme.setPreference("system")}>System</button></>;
}
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
it("persists the selection through remounting and can return to the system preference", async () => {
  const user = userEvent.setup();
  const view = render(<ThemeProvider theme={{}}><Controls /></ThemeProvider>);
  await user.click(screen.getByText("Dark"));
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  view.unmount();
  render(<ThemeProvider theme={{}}><Controls /></ThemeProvider>);
  expect(screen.getByText("dark")).toBeTruthy();
  await user.click(screen.getByText("System"));
  expect(document.documentElement.classList.contains("dark")).toBe(false);
});
it("keeps switching usable when browser storage is unavailable", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<ThemeProvider theme={{}}><Controls /></ThemeProvider>);
  await userEvent.setup().click(screen.getByText("Dark"));
  expect(document.documentElement.style.colorScheme).toBe("dark");
});
