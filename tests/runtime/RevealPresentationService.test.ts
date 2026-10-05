// @vitest-environment jsdom
/** Verifies focus ownership and cleanup at the Reveal API/browser event boundary. */
import type { RevealApi } from "reveal.js";
import { expect, it, vi } from "vitest";
import { RevealPresentationService } from "../../src/runtime/reveal/RevealPresentationService";
it("grants keyboard control only to the focused deck and detaches its listeners", () => {
  const first = document.createElement("div"); first.tabIndex = 0;
  const second = document.createElement("div"); second.tabIndex = 0;
  document.body.append(first, second);
  const firstApi = { configure: vi.fn(), layout: vi.fn() } as unknown as RevealApi;
  const secondApi = { configure: vi.fn(), layout: vi.fn() } as unknown as RevealApi;
  const detachFirst = new RevealPresentationService().attach(first, firstApi);
  const detachSecond = new RevealPresentationService().attach(second, secondApi);
  first.focus();
  expect(firstApi.configure).toHaveBeenLastCalledWith(expect.objectContaining({ keyboard: true }));
  second.focus();
  expect(firstApi.configure).toHaveBeenLastCalledWith({ keyboard: false });
  expect(secondApi.configure).toHaveBeenLastCalledWith(expect.objectContaining({ keyboard: true }));
  detachFirst(); detachSecond();
  const calls = vi.mocked(firstApi.configure).mock.calls.length;
  first.focus();
  expect(vi.mocked(firstApi.configure).mock.calls.length).toBe(calls);
  first.remove(); second.remove();
});
