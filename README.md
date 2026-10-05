# Rdocser

A client-only React documentation workspace with real Markdown/MDX articles, a connected document graph, search, and independent Reveal.js presentations. The interface uses official shadcn/ui Radix primitives and a configurable semantic theme.

Use Node.js **26.4 or newer**. The OpenTUI initialization wizard uses Node's experimental FFI; the `rdocser` executable enables it automatically for interactive initialization. See [OpenTUI runtime support](https://opentui.com/docs/getting-started/runtime-support).

## Install in your project

Until the first npm release, install directly from [GitHub](https://github.com/mzak-dev/rdocser):

```bash
npm install --save-dev github:mzak-dev/rdocser
npx rdocser init
```

After the package is published to npm:

```bash
npm install --save-dev rdocser
npx rdocser init
npx rdocser dev
npx rdocser build
```

Run these commands in an existing project's directory. The wizard asks for the project name, a local logo path (SVG, PNG, JPEG, WebP or GIF, up to 2 MB), and a forest, ocean or violet theme. Each theme includes light and dark colors. Use Enter to continue, arrow keys to choose a palette, and Esc or Ctrl+C to cancel without writing files. Logos are copied into `branding/` and embedded in the built site, so they work with relative deployment paths.

For CI or a terminal without interactive input:

```bash
npx rdocser init --yes --name "Acme Docs" --logo ./assets/logo.svg --theme ocean
```

`init` preserves existing configuration, theme and welcome document files. To change an initialized project, edit `theme.json` directly:

```json
{
  "branding": { "name": "Acme Docs", "logo": "./branding/logo.svg" },
  "colors": { "primary": "#245bbb" },
  "darkColors": { "primary": "#93bdff" }
}
```

Add scripts such as `"docs:dev": "rdocser dev"` and `"docs:build": "rdocser build"` to your project's `package.json`. This builds a standalone documentation site alongside your application. For a custom Vite runner, `rdocser/vite` exports the typed `createViteConfig({ packageRoot, projectRoot, docsDir, outDir })` adapter; `packageRoot` is the installed `rdocser` directory and `projectRoot` is your authoring directory.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run serve
```

Development defaults to localhost:5173 and preview to localhost:4173. The browser renders the application; there is no SSR or SSG. Hash routes and relative assets support GitHub Pages without server rewrites.

## Authoring

Put `.md` or `.mdx` files under `docs/`. Source-relative paths are document ids: `docs/guides/start.mdx` becomes `guides/start`. Frontmatter accepts title, description, group, order, type (article or presentation), and relations. Titles and groups otherwise come from headings and folders.

```yaml
---
title: Start here
group: Getting started
order: 1
relations:
  - target: guides/architecture
    kind: explains
---
```

Relative document links become hash navigation and graph relations. Headings, text, groups, and titles are searchable with Ctrl/Cmd+K. Invalid frontmatter and unknown explicit relation targets stop the build with a source filename. Symlinks and hidden folders are skipped.

MDX is trusted author-owned code. Import React components or export components from your document. Deck, Slide, Stack, and Fragment are available in MDX automatically; set `type: presentation` for decks. See the included authoring guide and two working presentations.

Editing, adding, or removing content refreshes the dev client. This refresh resets mounted local React state. Moving or resizing an already-open graph card preserves that state.

The default source directory can be replaced through CLI configuration; repository scripts also accept the `RDOCSER_DOCS_DIR` environment variable. The typed file at `src/generated/document-manifest.ts` is generated—do not hand-edit it.

## CLI and package

```bash
npm run build:cli
node bin/rdocser.mjs --help
node bin/rdocser.mjs init --root ./my-docs
node bin/rdocser.mjs dev --root ./my-docs
node bin/rdocser.mjs build --root ./my-docs
node bin/rdocser.mjs serve --root ./my-docs
npm pack
```

The packed package exposes the `rdocser` binary with an OpenTUI initialization wizard and a headless `--yes` mode. Non-interactive terminals use headless initialization automatically. Init uses exclusive file writes and preserves existing documents/configuration. Dev, build, serve, and preview share the same Vite adapter. `serve` and `preview` both serve the production output. OpenTUI is loaded only during interactive init.

Options: `--root`, `--docs-dir`, `--base`, `--out-dir`, `--port`, and `--host`. Defaults can be saved in `rdocser.config.json`:

```json
{ "docsDir": "docs", "base": "./", "outDir": "dist" }
```

Consuming projects use virtual metadata and theme modules; CLI builds do not rewrite installed package sources. Output directories are not emptied automatically, preventing accidental removal of other project files.

## Publishing from GitHub

The project uses the MIT license. The source repository is [mzak-dev/rdocser](https://github.com/mzak-dev/rdocser). Run the release checks on Node 26:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run build:cli
npm run test:tui
npm run test:package
```

`test:tui` exercises the native OpenTUI renderer, keyboard flow, palette preview and cancellation. `test:package` packs and installs the tarball in a temporary consumer project, then verifies CLI initialization, custom logo/theme, safe re-initialization, the Vite export and a production build.

For the first npm release, log in with `npm login` and run `npm publish --access public` from this directory (the name must be available or owned by your account). Then configure the package's [npm trusted publisher](https://docs.npmjs.com/trusted-publishers/) for your GitHub owner/repository, workflow `npm.yml`, environment `npm`, with direct publish allowed. Later releases use the `.github/workflows/npm.yml` workflow: update the package version and lockfile, commit, then push a matching tag such as `v0.1.1`. The workflow validates the package before publishing with OIDC and provenance. PRs and manual workflow runs perform checks without publishing.

## Theme and interaction

Edit `theme.json` to change colors, font families, radius, or animation preference. Fonts are bundled locally. Navigation uses a resizable 30/70 desktop split and a focus-managed mobile sheet.

Graph view supports pan/zoom, draggable cards, card resizing, up to five open MDX documents, and worker-backed d3-force physics. Interacting with open content pauses the simulation. Share links restore card positions/sizes and camera; local storage remembers the view when available. Collapsing a card resets that document's local component state. Shared links do not serialize arbitrary React state.

## GitHub Pages

The included `.github/workflows/pages.yml` installs locked dependencies, checks types and tests, builds the SPA, and deploys `dist/`. Enable Pages with **GitHub Actions** as its source. Deployment is not performed by local build commands.

URLs such as `#/article/guides/architecture`, `#/graph`, and `#/present/presentations/demo-deck` survive direct refresh. A project-site path needs no server-side route rewrites because all document routing is inside the hash.

## Architecture and acceptance

[Project plan](docs/adr/0001-project-plan.md), [content pipeline](docs/adr/0002-content-pipeline.md), [design system](docs/adr/0003-ui-and-theme.md), and [graph/presentation lifecycle](docs/adr/0004-graph-and-presentations.md) record decisions and limits.

Vite is the active engine (ADR 0002 supersedes the Rspress-specific engine choice in ADR 0001). Rspress is a future integration option; the compatibility config keeps SSG disabled.

Before a production release, run the browser acceptance suite and visually review desktop/mobile layouts, actual card dragging/resizing, and two simultaneous Reveal decks. Successful logic/DOM tests do not replace that check.

```bash
npx playwright install chromium
npm run test:e2e
```

See [implementation status](docs/implementation-status.md) for verified behavior and remaining release acceptance.

