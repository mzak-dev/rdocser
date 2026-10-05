// @vitest-environment jsdom
/** Exercises actual compiled author MDX and component state through the content renderer. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { DocumentRenderer } from "../../src/runtime/components/DocumentRenderer";
import { documentManifest } from "virtual:rdocser/documents";

it("loads real MDX, resolves source links and preserves author state across rerenders", async () => {
  const welcome = documentManifest.find(doc => doc.id === "welcome")!;
  const view = render(<div style={{ width: 500 }}><DocumentRenderer document={welcome} /></div>);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Try an interaction" }));
  await user.click(screen.getByRole("button", { name: "Try an interaction" }));
  expect(screen.getByText("Clicked 2 times")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Quick start" }).getAttribute("href")).toBe("#/article/guides/quick-start");
  view.rerender(<div style={{ width: 750, transform: "translate(120px, 80px)" }}><DocumentRenderer document={welcome} /></div>);
  expect(screen.getByText("Clicked 2 times")).toBeTruthy();
});
