---
title: Implementation status
group: Decisions
order: 34
---
# Implementation status

Updated: 2026-10-05.

## Delivered

- Recursive Markdown/MDX discovery, validated frontmatter, AST headings/text/links, and typed generated metadata.
- Real lazy MDX articles and presentation content, including an author-owned interactive React example.
- shadcn/ui Radix shell, responsive navigation, keyboard command search, resizable classic layout, and semantic theme tokens.
- React Flow document cards, independent resizing, worker-backed d3-force, named interaction pauses, local persistence, and validated versioned share URLs.
- Official Reveal React authoring components, embedded hash isolation, focus ownership, resize observation, standalone routes, and fullscreen controls.
- Init/dev/build/serve/preview commands, consuming-project virtual modules, typed Vite package export, package executable, MIT license, and GitHub workflows for npm and Pages.
- OpenTUI initialization on Node >=26.4 with project name, local logo and forest/ocean/violet light/dark themes; headless flags for CI. Branding is displayed in navigation and page titles, and logo bytes are embedded in production assets.

## Verified

Typecheck, unit/DOM integration tests, SPA build, and CLI bundle build pass. The checks exercise real source scanning, nested/Unicode routes, full-text ranking, graph state validation, worker lifecycle, Reveal focus cleanup, compiled interactive MDX, accessible search selection, a 500-document catalog, and production compilation of a separate source project without rewriting package sources.

The installed production dependencies have no reported vulnerabilities in the npm audit performed during this session.

The packed npm artifact was installed into a separate temporary consumer. Its installed binary successfully initialized and built that project, including CSS, local fonts, lazy document chunks, graph assets, and the physics worker.

## Remaining release acceptance

The optional Playwright suite covers browser routes, shared graph restoration, five open cards with actual dragging/resizing, two real Reveal decks, and mobile navigation. It has been prepared but not run. The integrated browser's URL policy blocked tool access to the local application during this session.

Before declaring a production release, visually review desktop/mobile layouts, run the browser suite, and measure the real-browser 500-document/five-open-card scenario. DOM tests verify component behavior, not layout correctness or real pointer geometry.

Markdown asset links/images still need bundler-aware rewriting; JSX asset imports are available through Vite. Shared graph state intentionally excludes arbitrary React state and Reveal slide state. Collapsing a card unmounts its content. Development content changes perform a full client refresh.

Rspress is a future adapter option. ADR 0002 explicitly replaces the original Rspress-specific engine choice with the operational Vite pipeline while retaining the client-only requirement.
