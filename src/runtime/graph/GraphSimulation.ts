/** Local, damped layout: rectangles make room and return to their resting positions. */
import { forceSimulation, forceX, forceY, type Force, type SimulationNodeDatum } from "d3-force";
import type { PhysicsNode } from "./GraphPhysicsService";
export type LayoutNode = PhysicsNode & SimulationNodeDatum & { homeX: number; homeY: number };
export interface LayoutEdge { source: string; target: string }
// The initial grid leaves 60px horizontally and 64px vertically between cards.
// A larger collision gap pushes even untouched cards away from their anchors.
const GAP = 60;

function rectangles(): Force<LayoutNode, undefined> {
  let nodes: LayoutNode[] = [];
  const force = () => {
    for (let iteration = 0; iteration < 3; iteration++) {
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = (b.x! + (b.vx ?? 0)) - (a.x! + (a.vx ?? 0));
        const dy = (b.y! + (b.vy ?? 0)) - (a.y! + (a.vy ?? 0));
        const overlapX = (a.width + b.width) / 2 + GAP - Math.abs(dx);
        const overlapY = (a.height + b.height) / 2 + GAP - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0 || (a.pinned && b.pinned)) continue;
        const shareA = a.pinned ? 0 : b.pinned ? 1 : 0.5;
        const shareB = b.pinned ? 0 : a.pinned ? 1 : 0.5;
        // Resolve along the shallowest axis. Bound impulses to avoid an explosive expansion.
        if (overlapX < overlapY) {
          const impulse = Math.sign(dx || (i < j ? 1 : -1)) * Math.min(overlapX, 48);
          a.vx! -= impulse * shareA; b.vx! += impulse * shareB;
        } else {
          const impulse = Math.sign(dy || 1) * Math.min(overlapY, 48);
          a.vy! -= impulse * shareA; b.vy! += impulse * shareB;
        }
      }
    }
  };
  force.initialize = (value: LayoutNode[]) => { nodes = value; };
  return force;
}

function relationSprings(edges: LayoutEdge[]): Force<LayoutNode, undefined> {
  let nodes: LayoutNode[] = [];
  const force = () => {
    const byId = new Map(nodes.map(node => [node.id, node]));
    for (const edge of edges) {
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      if (!source || !target) continue;
      const dx = (target.x ?? 0) - (source.x ?? 0);
      const dy = (target.y ?? 0) - (source.y ?? 0);
      const distance = Math.max(1, Math.hypot(dx, dy));
      const desired = 510 + Math.min(160, Math.abs(source.width - target.width) * 0.25);
      const strength = Math.max(-0.45, Math.min(0.45, (distance - desired) / desired * 0.18));
      const impulseX = dx / distance * strength;
      const impulseY = dy / distance * strength;
      if (!source.pinned) { source.vx = (source.vx ?? 0) + impulseX; source.vy = (source.vy ?? 0) + impulseY; }
      if (!target.pinned) { target.vx = (target.vx ?? 0) - impulseX; target.vy = (target.vy ?? 0) - impulseY; }
    }
  };
  force.initialize = (value: LayoutNode[]) => { nodes = value; };
  return force;
}

export function createGraphSimulation(input: PhysicsNode[], edges: LayoutEdge[] = []) {
  const nodes: LayoutNode[] = input.map(node => ({
    ...node, x: node.x + node.width / 2, y: node.y + node.height / 2,
    homeX: node.anchorX ?? node.x, homeY: node.anchorY ?? node.y,
    fx: node.pinned ? node.x + node.width / 2 : null,
    fy: node.pinned ? node.y + node.height / 2 : null,
  }));
  const x = forceX<LayoutNode>(node => node.homeX + node.width / 2).strength(0.16);
  const y = forceY<LayoutNode>(node => node.homeY + node.height / 2).strength(0.16);
  const simulation = forceSimulation(nodes).stop()
    .force("home-x", x).force("home-y", y).force("relations", relationSprings(edges)).force("rectangles", rectangles())
    .velocityDecay(0.55).alphaDecay(0.025).alphaMin(0.004);
  const update = (input: PhysicsNode[]) => {
    const updates = new Map(input.map(node => [node.id, node]));
    for (const node of nodes) {
      const next = updates.get(node.id);
      if (!next) continue;
      Object.assign(node, next, {
        x: next.x + next.width / 2, y: next.y + next.height / 2,
        homeX: next.anchorX ?? node.homeX, homeY: next.anchorY ?? node.homeY,
        fx: next.pinned ? next.x + next.width / 2 : null,
        fy: next.pinned ? next.y + next.height / 2 : null, vx: 0, vy: 0,
      });
    }
    x.x(node => node.homeX + node.width / 2);
    y.y(node => node.homeY + node.height / 2);
    simulation.alpha(0.8);
  };
  const positions = () => nodes.map(node => ({ id: node.id, x: node.x! - node.width / 2, y: node.y! - node.height / 2 }));
  return { simulation, update, positions };
}
