import assert from "node:assert/strict";
import { createTestRenderer } from "@opentui/core/testing";
import { runInitWizard } from "../package-dist/init-wizard.mjs";

const setup = await createTestRenderer({ width: 90, height: 26, exitOnCtrlC: false });
try {
  const result = runInitWizard({ name: "Acme Docs", logo: "./assets/acme.svg" }, async () => setup.renderer);
  await setup.waitForFrame(frame => frame.includes("Project name"));
  setup.mockInput.pressEnter();
  await setup.waitForFrame(frame => frame.includes("Logo file"));
  setup.mockInput.pressEnter();
  await setup.waitForFrame(frame => frame.includes("Choose theme"));
  setup.mockInput.pressArrow("down");
  await setup.waitForFrame(frame => frame.includes("Acme Docs · ./assets/acme.svg · ocean"));
  setup.mockInput.pressEnter();
  assert.deepEqual(await result, { name: "Acme Docs", logo: "./assets/acme.svg", theme: "ocean" });
} finally { setup.renderer.destroy(); }

for (const cancel of [input => input.pressEscape(), input => input.pressCtrlC()]) {
  const setup = await createTestRenderer({ width: 90, height: 26, exitOnCtrlC: false });
  try {
    const result = runInitWizard({}, async () => setup.renderer);
    await setup.waitForFrame(frame => frame.includes("Project name"));
    cancel(setup.mockInput);
    assert.equal(await result, undefined);
  } finally { setup.renderer.destroy(); }
}
console.log("OpenTUI: keyboard flow, palette preview and cancellation passed.");
