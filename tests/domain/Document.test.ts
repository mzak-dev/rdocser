/** Verifies the core document domain entities. */
import { describe, expect, it } from "vitest";
import { ArticleDocument } from "../../src/domain/documents/ArticleDocument";
describe("ArticleDocument",()=>{it("creates a stable article identity",()=>{const doc=new ArticleDocument("intro","Intro","Basics",1,"docs/intro.mdx");expect(doc.id.value).toBe("intro");expect(doc.type).toBe("article");});});
