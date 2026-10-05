/** Provides DOM-only browser APIs needed by runtime tests without changing real-browser behavior. */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => { if (typeof document !== "undefined") cleanup(); });
if (typeof window !== "undefined") {
  window.matchMedia = query => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLElement.prototype.scrollTo = function () {};
  const capturedPointers = new WeakMap<HTMLElement, Set<number>>();
  window.HTMLElement.prototype.setPointerCapture = function (id) {
    const ids = capturedPointers.get(this) ?? new Set<number>();
    ids.add(id); capturedPointers.set(this, ids);
  };
  window.HTMLElement.prototype.hasPointerCapture = function (id) { return capturedPointers.get(this)?.has(id) ?? false; };
  window.HTMLElement.prototype.releasePointerCapture = function (id) { capturedPointers.get(this)?.delete(id); };
  class TestResizeObserver { observe() {} unobserve() {} disconnect() {} }
  window.ResizeObserver = TestResizeObserver;
  globalThis.ResizeObserver = TestResizeObserver;
}

