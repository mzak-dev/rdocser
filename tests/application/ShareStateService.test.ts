/** Tests graph link interchange at its public, untrusted URL boundary. */
import { expect, it } from "vitest";
import { ShareStateService } from "../../src/application/services/ShareStateService";

it("round trips Unicode ids, positions, sizes and camera state", () => {
  const service = new ShareStateService();
  const state = { version: 1 as const, open: ["guides/żółć"], camera: { x: 10, y: -20, zoom: 1.25 }, positions: { "guides/żółć": { x: 120, y: 300 } }, sizes: { "guides/żółć": { width: 500, height: 420 } } };
  expect(service.decode(service.encode(state))).toEqual(state);
});

it("rejects malformed or unsafe graph state instead of trusting parsed JSON", () => {
  const service = new ShareStateService();
  expect(service.decode("not-a-state")).toBeNull();
  expect(service.decode(btoa(encodeURIComponent(JSON.stringify({ open: ["intro"], camera: { x: 0, y: 0, zoom: -1 }, sizes: {} }))))).toBeNull();
});
