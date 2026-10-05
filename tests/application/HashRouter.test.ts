/** Specifies nested and Unicode document routes that survive static-host refreshes. */
import { expect, it } from "vitest";
import { HashRouter } from "../../src/application/services/HashRouter";

it("preserves document identity and heading through a hash URL", () => {
  const router = new HashRouter();
  expect(router.read(router.document("guides/żółć", "article", "a heading"))).toMatchObject({ mode: "classic", documentId: "guides/żółć", heading: "a heading" });
});
it("retains graph mode when a search result selects a document", () => {
  const router = new HashRouter();
  expect(router.read(router.graph("guides/architecture"))).toEqual({ mode: "graph", documentId: "guides/architecture", shared: undefined });
  expect(router.read("#/graph?state=payload")).toMatchObject({ mode: "graph", shared: "payload" });
  expect(router.read(router.graph("guides/architecture", "shared-layout"))).toMatchObject({ documentId: "guides/architecture", shared: "shared-layout" });
});
it("distinguishes standalone presentations and recovers from malformed encodings", () => {
  const router = new HashRouter();
  expect(router.read("#/present/decks/intro")).toMatchObject({ standalone: true, documentId: "decks/intro" });
  expect(router.read("#/article/%GG")).toEqual({ mode: "classic", documentId: "" });
});
