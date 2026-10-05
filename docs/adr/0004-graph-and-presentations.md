---
title: ADR 004 · Graph and presentations
group: Decisions
order: 33
---
# ADR 0004 — Stable cards and isolated presentations

Status: accepted  
Date: 2026-10-05

## Context

Interactive MDX must retain its state while the reader moves or resizes an open graph card. Multiple presentations must not compete for global keyboard or URL state.

## Decision

Use React Flow with stable document node identities and cached lazy MDX component identities. Expanding or collapsing is explicit; position and size changes keep open content mounted. Up to five document cards may be expanded simultaneously.

Run d3-force in a dedicated module worker. Relation springs pull connected cards together, rectangle collisions reserve space between cards, and damped home forces bring displaced cards back toward their resting positions. Updates are throttled to roughly 40 messages per second. The latest opened, resized, or dragged card stays anchored while the rest of the graph responds. Named pause reasons compose manual pause, dragging, and resizing.

Edges choose the nearest side of each card and use offset smooth-step paths with arrowheads. Hovering a card emphasizes its neighborhood and reduces unrelated connections. The physics remains the source of motion; edge routing only keeps the visual connections legible.

An article can be detached into a movable, nonmodal canvas reader while its graph card collapses. React Flow's ViewportPortal gives the reader independent graph coordinates and the shared canvas camera. Dragging and resizing account for zoom; graph physics does not move detached readers. A single portal host moves between card and reader so MDX state and scrolling survive the transition. Detached readers are temporary and excluded from persisted or shared views.

Share a versioned graph state containing open identities, camera, sizes, and positions. Validate untrusted URL payloads, bound their size, reject invalid dimensions/coordinates, and filter restored identities through the current catalog. Local persistence is optional and storage failure must not break reading.

Expose Deck, Slide, Stack, and Fragment through the official Reveal React wrapper. Rdocser forces embedded mode and disables presentation hash/history handling. A runtime service owns resize observation and focus-controlled keyboard activation. The wrapper owns Reveal instance creation and destruction. Presentations have dedicated standalone routes and fullscreen controls.

## Consequences

Graph exploration is lazy-loaded separately from the reader, and Reveal is loaded only when presentation content needs it. There is no node virtualization that would unmount offscreen open cards and discard their local state.

Collapsing a card intentionally unmounts its document content. Share state restores the view, not arbitrary React component state or Reveal slide history. Browser acceptance must verify moving/resizing five open cards and two simultaneous real Reveal decks.

