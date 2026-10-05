---
title: ADR 003 · Reader and design system
group: Decisions
order: 32
---
# ADR 0003 — shadcn primitives and a focused reader

Status: accepted  
Date: 2026-10-05

## Context

The first shell used raw controls, fixed dark colors, a hidden mobile sidebar, and a manually rendered subset of Markdown. It did not provide a suitable reading experience or a consistent accessibility foundation.

## Decision

Use official shadcn/ui Radix components installed through its CLI, with Tailwind v4 and semantic CSS tokens. Components are owned source files under `src/components/ui`. Local imports use the project's `cn` helper. The upstream command dialog is corrected so its accessible title and description live inside dialog content.

The default theme is a quiet, warm neutral palette with a restrained green accent and a bundled local Geist font. `theme.json` supplies colors, fonts, radius, and animation preference; derived semantic surfaces ensure portals and graph controls share the same theme.

The classic view starts with the ADR 0001 30/70 split and exposes an accessible resizable separator. Smaller screens use a focus-managed Sheet. Search uses a Command dialog with Ctrl/Cmd+K, ranked full-text results, and keyboard navigation.

Articles have readable line lengths, generated heading navigation, source context, and previous/next links. Catalog collections are built from actual source metadata.

## Consequences

The runtime uses established keyboard and focus behavior for overlays and controls. Styling stays in semantic tokens rather than isolated hardcoded component colors.

Respect reduced-motion preferences and the project's animation preference. Browser-level visual review is a separate acceptance step; DOM integration and successful builds do not establish visual correctness.

