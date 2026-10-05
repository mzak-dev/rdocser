---
title: ADR 002 · Content pipeline
group: Decisions
order: 31
---
# ADR 0002 — One client-only content pipeline

Status: accepted  
Date: 2026-10-05  
Supersedes: the Rspress-specific build-engine choice in ADR 0001. All other product and layering decisions remain in force.

## Context

The existing operational entry point was Vite; the Rspress adapters were placeholders. Rdocser owns the shell, content routing, graph, and Reveal instances. Maintaining a second framework-owned route system would duplicate those responsibilities before the product has a distributable runtime.

The session handoff allows Rspress with SSG disabled, rather than requiring it as the only engine.

## Decision

Use one Vite pipeline for repository development and the headless npm CLI. Compile Markdown/MDX with the official MDX Rollup integration, GFM, and heading slugs. The output is a browser-rendered SPA, with relative assets and hash routes. No SSR or SSG is performed.

A class-based filesystem adapter scans trusted author files. It reads frontmatter and parses Markdown syntax trees for headings, text, and document links. Nested source-relative paths are stable document identities. Invalid metadata, duplicate identities, and unresolved explicit relations fail the build.

Provide metadata and lazy content imports through a typed virtual module. Repository dev/build additionally writes the inspectable generated TypeScript manifest. Installed CLI projects use virtual modules without writing into package-installed sources.

Theme loading also uses a virtual module rooted at the consuming project. Content additions, removals, and edits invalidate metadata and refresh development clients.

## Consequences

Graph and search data come from the same content projection. Document chunks load only when selected or expanded. Runtime components never scan files or parse frontmatter.

A Rspress engine remains a possible future adapter, with SSG disabled and the Rdocser-owned shell retained. It is not advertised as an operational engine in this release. The compatibility config records the no-SSG constraint.

MDX executes trusted project code. This pipeline is not a sandbox for arbitrary uploaded documents. Ordinary asset links and Markdown images require additional bundler handling; authored JSX imports can use Vite's asset support today.

