---
title: ADR 001 · Project plan
group: Decisions
order: 30
---
# Project plan — Rdocser SPA

Status: accepted

Implementation update (2026-10-05): ADR 0002 supersedes the Rspress-specific engine choice with the shared client-only Vite adapter. ADRs 0003 and 0004 record the delivered UI and graph/presentation contracts. The implementation-state section below describes the original scaffold at the time of this plan; current verification and remaining acceptance work are recorded in [implementation status](../implementation-status.md).

## Purpose

Rdocser is a client-only React SPA for interactive documentation. It reads Markdown/MDX documents from `docs/` by default, presents them in a classic documentation layout or an explorable graph, and can include interactive author-owned React components and Reveal.js presentations.

The application must remain a SPA: no SSR and no SSG. GitHub Pages deployment uses hash routing so direct refreshes work without server rewrites.

## Product decisions

- React + MDX is the primary authoring stack.
- Rspress is used as the content/build integration with `ssg: false`; the product owns the shell, manifest, search, graph, theme, and presentation integration.
- The distributable is an npm package with CLI commands for `init`, `dev`, `build`, `serve`, and `preview`.
- The default source directory is `docs/`; a configured directory can replace it.
- Folder structure creates navigation groups. Frontmatter can override title, group, order, type, and relations.
- Documents are either `article` or `presentation`.
- Article links and explicit frontmatter relations create graph edges.
- The classic layout starts at 30/70 and supports a resizable separator.
- Graph mode supports pan, zoom, draggable cards, resizable cards, and a live physics layout. Physics pauses while the reader interacts with an open card.
- Search covers titles, groups, headings, and document text. Results open in the current mode.
- Share links encode open documents, card sizes, positions, and camera state in the URL hash.
- `theme.json` contains minimal design tokens: colors, fonts, radius, and animation preference.
- Reveal.js presentations are first-class documents. Authors use explicit `Deck`, `Slide`, `Stack`, and `Fragment` components in MDX. v1 includes navigation, transitions, touch, and fullscreen, but not speaker notes or PDF export.
- OpenTUI is out of scope.

## Architecture

Keep the project split into four dependency directions:

1. `src/domain/` contains framework-independent entities and value objects: documents, navigation groups, graph relations, graph projections, and search projections.
2. `src/application/` contains ports, services, and use cases. Services coordinate work but do not read files or import React, Vite, or Rspress.
3. `src/infrastructure/` adapts Node filesystem, Rspress/Vite, browser storage, and the client search index to application ports.
4. `src/runtime/` contains React components, contexts, browser bootstrap, graph UI, Reveal.js UI, and theme application.

Use classes for domain entities, repositories, services, adapters, and use cases. Keep React components functional and thin: components render state and dispatch user events; they do not scan files, build indexes, or implement graph physics.

Important service boundaries:

- `DocumentCatalogService` builds and queries the navigation tree.
- `DocumentGraphService` converts document metadata and links into nodes and edges.
- `SearchIndexService` builds and queries the client search index.
- `ShareStateService` encodes/decodes graph state for hash URLs.
- `ThemeService` validates and resolves theme tokens.
- `GraphPhysicsService` owns the worker lifecycle and position updates.
- `RevealPresentationService` owns mounting, resizing, and unmounting Reveal instances.

## Source tree contract

The intended structure is documented in [architecture.md](../architecture.md). Important paths include:

- `src/domain/` — pure domain classes and projections.
- `src/application/` — services, ports, and use cases.
- `src/infrastructure/` — filesystem/build/browser adapters.
- `src/runtime/` — SPA components and browser-only integrations.
- `src/generated/document-manifest.ts` — generated runtime manifest; it must not be hand-edited once the scanner is connected.
- `docs/adr/` — architectural decisions and handoff references.

Every important source file starts with a short responsibility comment. Comments should explain why a file exists, not restate obvious code.

## Current implementation state

The repository currently contains an initial scaffold and a small working shell:

- React/Vite entry point and responsive CSS shell exist.
- Hash routing, home catalog, grouped sidebar, search filtering, classic mode, and a simple graph-card mode exist.
- Sample MDX documents and `theme.json` exist.
- Domain classes and service placeholders exist.
- CLI command classes and npm scripts exist.
- `rspress.config.ts` sets `ssg: false`.

The following are still incomplete and must be implemented before calling the product functional:

- Scan `docs/` during dev/build and generate the manifest instead of using sample data.
- Parse frontmatter, headings, links, and explicit relations.
- Compile and lazy-load real MDX components.
- Connect Rspress/Vite to `dev`, `build`, `serve`, and `preview` CLI commands.
- Replace the visual graph placeholder with React Flow and the worker-backed d3-force layout.
- Implement card resize, card state preservation, graph persistence, and share-state controls.
- Integrate `@revealjs/react` with isolated instances for graph cards and a standalone presentation route.
- Apply `theme.json` tokens to CSS variables.
- Add shadcn-style accessible primitives and keyboard/mobile behavior.
- Add meaningful unit and integration tests.

## Delivery order for the next session

1. Verify dependencies and establish a clean `typecheck`, test, and build loop.
2. Implement the document scanner and frontmatter parser, then generate a typed manifest.
3. Connect the manifest to the SPA and replace hardcoded sample entries.
4. Compile/load MDX articles and presentation documents lazily.
5. Finish classic layout, accessible navigation, theme tokens, and search result navigation.
6. Implement React Flow graph cards, resizing, worker physics, and graph share state.
7. Integrate Reveal.js with card isolation and standalone presentation mode.
8. Implement CLI adapters and GitHub Actions documentation.
9. Add tests for domain entities, scanning, manifest generation, routing, graph state, Reveal lifecycle, and the 500-document/5-open-card scenario.

## Acceptance criteria

- `npm install`, `npm run typecheck`, `npm test`, and `npm run build` pass.
- `npm run dev` opens the SPA locally with HMR.
- `npm run build && npm run serve` serves a client-only build locally.
- Adding or editing a Markdown/MDX file under `docs/` changes navigation, search, and graph data after a rebuild or supported dev reload.
- Hash URLs survive direct refresh on GitHub Pages.
- Five open cards retain their internal component state while moving/resizing.
- Two simultaneous Reveal.js presentations do not share keyboard focus, hash state, or event listeners.
- A 500-document fixture remains usable with five expanded cards.
