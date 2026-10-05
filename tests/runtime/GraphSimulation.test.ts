/** Regression checks for expansion, collapse and correct rectangle coordinates. */
import { expect, it } from "vitest";
import { createGraphSimulation } from "../../src/runtime/graph/GraphSimulation";
import type { PhysicsNode } from "../../src/runtime/graph/GraphPhysicsService";
const card = (id: string, x: number, y: number): PhysicsNode => ({ id, x, y, anchorX: x, anchorY: y, width: 280, height: 184 });
function settle(layout: ReturnType<typeof createGraphSimulation>) { layout.simulation.tick(260); return layout.positions(); }

it("keeps compact rectangles at rest instead of drifting or treating top-left as center", () => {
  const input = [card("a", 0, 0), card("b", 340, 0), card("c", 0, 248)];
  const layout = createGraphSimulation(input);
  const positions = settle(layout);
  positions.forEach((position, index) => { expect(position.x).toBeCloseTo(input[index].x, 1); expect(position.y).toBeCloseTo(input[index].y, 1); });
});
it("expanding displaces neighbors and collapsing brings them back", () => {
  const input = [card("a", 0, 0), card("b", 340, 0), card("c", 0, 248), card("d", 340, 248)];
  const layout = createGraphSimulation(input);
  layout.update(input.map(node => node.id === "a" ? { ...node, width: 520, height: 440, pinned: true } : node));
  const opened = settle(layout);
  expect(opened[0]).toEqual({ id: "a", x: 0, y: 0 });
  expect(opened[1].x).toBeGreaterThan(540);
  expect(opened[2].y).toBeGreaterThan(460);
  layout.update(input.map(node => ({ ...node, ...opened.find(position => position.id === node.id), pinned: false })));
  const closed = settle(layout);
  expect(Math.abs(closed[1].x - 340)).toBeLessThan(5);
  expect(Math.abs(closed[2].y - 248)).toBeLessThan(5);
});
it("restored and manually arranged cards still yield to an expanding neighbor", () => {
  const input = [card("a", -400, -200), card("b", -60, -200)];
  const layout = createGraphSimulation(input);
  layout.update([{ ...input[0], pinned: true, width: 800, height: 500 }, input[1]]);
  const moved = settle(layout)[1];
  expect(Math.hypot(moved.x - input[1].x, moved.y - input[1].y)).toBeGreaterThan(150);
  expect(moved.x >= 400 || moved.y + 184 <= -200 || moved.y >= 300).toBe(true);
});
it("separates coincident cards without non-finite positions", () => {
  const layout = createGraphSimulation([card("a", 0, 0), card("b", 0, 0)]);
  const positions = settle(layout);
  expect(Math.abs(positions[0].y - positions[1].y)).toBeGreaterThan(180);
  expect(positions.every(node => Number.isFinite(node.x) && Number.isFinite(node.y))).toBe(true);
});
