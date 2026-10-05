/** Owns the animation clock off the main thread; publishes React Flow top-left coordinates. */
import { createGraphSimulation } from "./GraphSimulation";
import type { PhysicsMessage } from "./GraphPhysicsService";
let layout: ReturnType<typeof createGraphSimulation> | undefined;
let paused = false;
let lastPosted = 0;
const scope = self as unknown as DedicatedWorkerGlobalScope;
const post = () => { if (layout) scope.postMessage(layout.positions()); };
scope.onmessage = (event: MessageEvent<PhysicsMessage>) => {
  const message = event.data;
  if (message.type === "initialize") {
    layout?.simulation.stop();
    layout = createGraphSimulation(message.nodes, message.edges);
    layout.simulation.on("tick", () => {
      const now = performance.now();
      if (now - lastPosted >= 24) { lastPosted = now; post(); }
    }).on("end", post);
    if (!paused) layout.simulation.restart();
  } else if (message.type === "pause") { paused = true; layout?.simulation.stop(); }
  else if (message.type === "resume") {
    paused = false;
    if (layout && layout.simulation.alpha() > layout.simulation.alphaMin()) layout.simulation.restart();
  } else if (message.type === "update" && layout) {
    layout.update(message.nodes);
    if (!paused) layout.simulation.restart();
  }
};
