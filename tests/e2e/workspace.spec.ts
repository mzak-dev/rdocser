/** Browser acceptance for real layout and interaction; run separately from DOM tests. */
import { expect, test } from "@playwright/test";

test("reads actual MDX and navigates search and direct-refresh routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start reading" }).click();
  await page.getByRole("button", { name: "Try an interaction" }).click();
  await expect(page.getByText("Clicked 1 times")).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("four layers");
  await page.getByRole("option", { name: /Architecture/ }).first().click();
  await expect(page).toHaveURL(/#\/article\//);
  await page.reload();
  await expect(page.locator(".document-title")).toContainText("Architecture");
});

test("keeps the graph mode when search opens a card and restores a shared view", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/graph?document=welcome");
  await expect(page.locator(".document-node[data-expanded=true]")).toHaveCount(1);
  await page.getByRole("button", { name: "Try an interaction" }).click();
  await page.getByRole("button", { name: "Share graph", exact: true }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(link);
  await expect(page.locator(".document-node[data-expanded=true]")).toHaveCount(1);
  await expect(page.getByText("Clicked 0 times")).toBeVisible();
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("authoring documents");
  await page.getByRole("option", { name: /Authoring documents/ }).click();
  await expect(page).toHaveURL(/#\/graph/);
  await expect(page.locator(".document-node[data-expanded=true]")).toHaveCount(2);
});

test("keeps five open cards mounted while moving and resizing an interactive card", async ({ page }) => {
  await page.goto("/#/graph?document=welcome");
  await page.getByRole("button", { name: "Try an interaction" }).click();
  const ids = ["guides/quick-start", "guides/architecture", "guides/authoring", "guides/graph"];
  for (const id of ids) {
    await page.goto(`/#/graph?document=${encodeURIComponent(id)}`);
    await expect(page.locator(`.react-flow__node[data-id="${id}"] .document-node`)).toHaveAttribute("data-expanded", "true");
  }
  await expect(page.locator(".document-node[data-expanded=true]")).toHaveCount(5);
  await page.goto("/#/graph?document=welcome");
  const card = page.locator('.react-flow__node[data-id="welcome"]');
  const header = await card.locator(".node-drag-handle").boundingBox();
  if (!header) throw new Error("Card header is not visible");
  await page.mouse.move(header.x + 40, header.y + 20);
  await page.mouse.down(); await page.mouse.move(header.x + 120, header.y + 70, { steps: 12 }); await page.mouse.up();
  await expect(card.getByText("Clicked 1 times")).toBeVisible();
  const handle = await card.locator(".react-flow__resize-control.bottom.right.handle").boundingBox();
  if (!handle) throw new Error("Resize handle is not visible");
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down(); await page.mouse.move(handle.x + 70, handle.y + 40, { steps: 12 }); await page.mouse.up();
  await expect(card.getByText("Clicked 1 times")).toBeVisible();
});

test("isolates two real Reveal decks and preserves slide position on resize", async ({ page }) => {
  await page.goto("/#/graph?document=presentations%2Fdemo-deck");
  await page.goto("/#/graph?document=presentations%2Fsecond-deck");
  const first = page.locator('.react-flow__node[data-id="presentations/demo-deck"] .presentation-host');
  const second = page.locator('.react-flow__node[data-id="presentations/second-deck"] .presentation-host');
  await expect(page.locator(".presentation-host .reveal.ready")).toHaveCount(2);
  const initial = await first.locator(".slides > section.present").innerText();
  await second.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second.locator(".slides > section.present")).toContainText("One focused idea");
  expect(await first.locator(".slides > section.present").innerText()).toBe(initial);
  await expect(page).toHaveURL(/#\/graph/);
});

test("places a detached article independently on the canvas and shares its pan and zoom", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/graph?document=welcome");
  const card = page.locator('.react-flow__node[data-id="welcome"]');
  await card.getByRole("button", { name: "Try an interaction" }).click();
  const content = card.locator(".node-document-content");
  await content.evaluate(element => { element.scrollTop = 120; });
  const scrollTop = await content.evaluate(element => element.scrollTop);
  await card.getByRole("button", { name: "Open Welcome in popup" }).click();
  const reader = page.getByRole("dialog", { name: "Welcome" });
  await expect(page.locator(".react-flow__viewport-portal .floating-article")).toHaveCount(1);
  await expect(reader.getByText("Clicked 1 times")).toBeVisible();
  await expect(card.locator(".document-node")).toHaveAttribute("data-expanded", "false");
  expect(await reader.evaluate(element => getComputedStyle(element).position)).toBe("absolute");
  expect(await reader.locator(".node-document-content").evaluate(element => element.scrollTop)).toBe(scrollTop);

  const cardPosition = await card.getAttribute("style");
  const before = await reader.boundingBox();
  const header = await reader.getByRole("button", { name: "Move Welcome popup" }).boundingBox();
  if (!before || !header) throw new Error("Canvas reader is not visible");
  await page.mouse.move(header.x + 40, header.y + header.height / 2);
  await page.mouse.down(); await page.mouse.move(header.x + 140, header.y + header.height / 2 + 20, { steps: 10 }); await page.mouse.up();
  const moved = await reader.boundingBox();
  expect(moved!.x - before.x).toBeCloseTo(100, 0);
  expect(moved!.y - before.y).toBeCloseTo(20, 0);
  expect(await card.getAttribute("style")).toBe(cardPosition);

  const graphPosition = await reader.evaluate(element => ({ x: element.style.left, y: element.style.top }));
  const pane = await page.locator(".react-flow__pane").boundingBox();
  if (!pane) throw new Error("Graph canvas is not visible");
  await page.mouse.move(pane.x + 120, pane.y + pane.height - 40);
  await page.mouse.down(); await page.mouse.move(pane.x + 50, pane.y + pane.height - 80, { steps: 10 }); await page.mouse.up();
  const panned = await reader.boundingBox();
  expect(panned!.x - moved!.x).toBeCloseTo(-70, 0);
  expect(panned!.y - moved!.y).toBeCloseTo(-40, 0);
  expect(await reader.evaluate(element => ({ x: element.style.left, y: element.style.top }))).toEqual(graphPosition);

  await page.locator(".react-flow__controls-zoomout").click();
  await expect.poll(async () => (await reader.boundingBox())!.width).toBeLessThan(panned!.width - 10);
  const resizedBefore = await reader.boundingBox();
  const resize = await reader.getByRole("button", { name: "Resize Welcome reader" }).boundingBox();
  if (!resize) throw new Error("Canvas reader resize handle is not visible");
  await page.mouse.move(resize.x + resize.width / 2, resize.y + resize.height / 2);
  await page.mouse.down(); await page.mouse.move(resize.x + resize.width / 2 + 60, resize.y + resize.height / 2 + 40, { steps: 10 }); await page.mouse.up();
  const resized = await reader.boundingBox();
  expect(resized!.width - resizedBefore!.width).toBeCloseTo(60, 0);
  expect(resized!.height - resizedBefore!.height).toBeCloseTo(40, 0);
  await expect(reader.getByText("Clicked 1 times")).toBeVisible();
  await reader.getByRole("button", { name: "Return Welcome to graph" }).click();
  await expect(reader).toHaveCount(0);
  await expect(card.getByText("Clicked 1 times")).toBeVisible();
  expect(await card.locator(".node-document-content").evaluate(element => element.scrollTop)).toBe(scrollTop);
});

test("provides mobile navigation without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Welcome", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try an interaction" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
