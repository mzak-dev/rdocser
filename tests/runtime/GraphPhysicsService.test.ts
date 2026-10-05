/** Verifies worker ownership and independent pause reasons through the worker protocol. */
import { afterEach, expect, it, vi } from "vitest";
import { GraphPhysicsService } from "../../src/runtime/graph/GraphPhysicsService";

afterEach(() => vi.unstubAllGlobals());
it("keeps the worker paused until all interactions release and terminates it on teardown", () => {
  const created: FakeWorker[] = [];
  class FakeWorker {
    postMessage = vi.fn(); terminate = vi.fn(); onmessage?: (event: { data: unknown }) => void;
    constructor() { created.push(this); }
  }
  vi.stubGlobal("Worker", FakeWorker);
  const service = new GraphPhysicsService();
  const positions = vi.fn();
  const unsubscribe = service.subscribe(positions);
  service.start([{ id: "intro", x: 0, y: 0, width: 280, height: 184 }], []);
  service.pause("drag"); service.pause("focus"); service.resume("drag");
  expect(created[0].postMessage).toHaveBeenLastCalledWith({ type: "pause" });
  service.resume("focus");
  expect(created[0].postMessage).toHaveBeenLastCalledWith({ type: "resume" });
  created[0].onmessage?.({ data: [{ id: "intro", x: 120, y: 60 }] });
  expect(positions).toHaveBeenCalledWith([{ id: "intro", x: 120, y: 60 }]);
  unsubscribe(); service.stop();
  expect(created[0].terminate).toHaveBeenCalledOnce();
});
