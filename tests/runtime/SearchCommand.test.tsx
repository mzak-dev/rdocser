// @vitest-environment jsdom
/** Verifies search navigation through the actual accessible command dialog. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { SearchCommand } from "../../src/runtime/navigation/SearchCommand";
import { documentManifest } from "virtual:rdocser/documents";

it("opens by keyboard, searches body text, and dispatches the selected document", async () => {
  const selected = vi.fn();
  const user = userEvent.setup();
  render(<SearchCommand documents={documentManifest} onSelect={selected} />);
  await user.keyboard("{Control>}k{/Control}");
  expect(screen.getByRole("dialog").getAttribute("aria-labelledby")).toBeTruthy();
  await user.type(screen.getByRole("combobox"), "path to follow");
  await user.click(await screen.findByRole("option", { name: /Welcome/ }));
  expect(selected).toHaveBeenCalledWith("welcome");
  expect(screen.queryByRole("dialog")).toBeNull();
});
