// @vitest-environment jsdom
/** Detaching must keep the existing MDX instance and scroll host alive. */
import { useState, type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { documentManifest } from "virtual:rdocser/documents";
import { DocumentNode, type DocumentNodeData } from "../../src/runtime/graph/DocumentNode";
vi.mock("@xyflow/react", () => ({
  Handle: () => null, NodeResizer: () => null, Position: { Left: "left", Right: "right" },
  ViewportPortal: ({ children }: { children: ReactNode }) => <div className="react-flow__viewport-portal">{children}</div>,
  useReactFlow: () => ({ getNode: () => ({ position: { x: 100, y: 200 }, width: 280 }), getZoom: () => 0.5, fitBounds: vi.fn() }),
}));
function Reader() {
  const [mode, setMode] = useState("open");
  const data: DocumentNodeData = {
    document: documentManifest.find(doc => doc.id === "welcome")!, open: mode === "open", floating: mode === "floating",
    toggle: () => setMode(mode === "open" ? "closed" : "open"), detach: () => setMode("floating"), closePopup: () => setMode("closed"),
    navigate: () => {}, read: () => {}, interaction: () => {},
  };
  return <DocumentNode id="welcome" data={data} type="document" selected={false} dragging={false} draggable selectable deletable={false} isConnectable={false} zIndex={0} positionAbsoluteX={0} positionAbsoluteY={0} />;
}
it("collapses the graph card while keeping state and scroll through detach, move and dock", async () => {
  render(<Reader />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Try an interaction" }));
  const host = document.querySelector(".node-document-content") as HTMLElement;
  host.scrollTop = 120; fireEvent.scroll(host);
  await user.click(screen.getByRole("button", { name: "Open Welcome in popup" }));
  const popup = screen.getByRole("dialog", { name: "Welcome" });
  expect(popup.closest(".react-flow__viewport-portal")).toBeTruthy();
  expect(popup.style.left).toBe("428px");
  expect(popup.style.top).toBe("200px");
  expect(within(popup).getByText("Clicked 1 times")).toBeTruthy();
  expect(document.querySelector(".document-node")?.getAttribute("data-expanded")).toBe("false");
  expect(popup.contains(host)).toBe(true);
  expect(host.scrollTop).toBe(120);
  const before = Number.parseFloat(popup.style.left);
  await user.keyboard("{ArrowRight}");
  expect(Number.parseFloat(popup.style.left)).toBe(before + 24);
  fireEvent.keyDown(within(popup).getByRole("button", { name: "Resize Welcome reader" }), { key: "ArrowRight" });
  expect(popup.style.width).toBe("584px");
  await user.click(within(popup).getByRole("button", { name: "Return Welcome to graph" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText("Clicked 1 times")).toBeTruthy();
  expect(document.querySelector(".node-content-slot")?.contains(host)).toBe(true);
  expect(host.scrollTop).toBe(120);
  await user.click(screen.getByRole("button", { name: "Open Welcome in popup" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open Welcome in popup" }));
});
