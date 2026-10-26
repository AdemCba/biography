import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

process.env.CONTENT_DIR = path.join(__dirname, "fixtures/content");

let content: typeof import("@/lib/content");
let quality: typeof import("@/lib/quality");
beforeAll(async () => {
  content = await import("@/lib/content");
  quality = await import("@/lib/quality");
});

function storeWith(mutate: (store: ReturnType<typeof content.readContent>) => void) {
  const store = content.readContent();
  mutate(store);
  return store;
}

const codes = (store: ReturnType<typeof content.readContent>, id: string, locale = "en") =>
  quality
    .checkContent(store)
    .reports.find((r) => r.personId === id && r.locale === locale)!
    .issues.filter((i) => i.level === "error")
    .map((i) => i.code);

describe("quality gate", () => {
  it("passes the well-formed fixtures", () => {
    const { reports, issues } = quality.checkContent(content.readContent());
    expect(issues).toEqual([]);
    for (const r of reports.filter((r) => r.status === "published")) {
      expect(r.issues.filter((i) => i.level === "error"), `${r.personId}/${r.locale}`).toEqual([]);
    }
  });

  it("only warns on drafts", () => {
    expect(codes(content.readContent(), "mira-okafor", "es")).toEqual([]);
  });

  it("blocks thin articles", () => {
    const store = storeWith((s) => {
      const a = s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!;
      a.body = "Ana rows [s:federation]. She won [s:daily]. Again [s:federation].";
    });
    expect(codes(store, "ana-ferreira")).toEqual(expect.arrayContaining(["too-short", "thin-structure"]));
  });

  it("requires a human reviewer and an author", () => {
    const store = storeWith((s) => {
      const meta = s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!.meta;
      meta.reviewer = undefined;
      meta.author = undefined;
    });
    expect(codes(store, "ana-ferreira")).toEqual(expect.arrayContaining(["no-reviewer", "no-author"]));
  });

  it("rejects citations to unknown sources and reviewers who are not editors", () => {
    const store = storeWith((s) => {
      const a = s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!;
      a.body += "\n\nA made-up claim [s:nowhere].";
      a.meta.reviewer = "someone-else";
    });
    expect(codes(store, "ana-ferreira")).toEqual(expect.arrayContaining(["unknown-citation", "unknown-editor"]));
  });

  it("flags cliché-heavy AI prose", () => {
    const store = storeWith((s) => {
      const a = s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!;
      a.body += "\n\nHer unwavering dedication is a testament to a meteoric rise. In conclusion, she is a true icon and a household name.";
    });
    expect(codes(store, "ana-ferreira")).toContain("ai-style");
  });

  it("detects near-duplicate templated articles", () => {
    const store = storeWith((s) => {
      const ana = s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!;
      const jonas = s.people.find((p) => p.data.id === "jonas-keller")!.articles.en!;
      jonas.body = ana.body.replaceAll("Ana Ferreira", "Jonas Keller").replaceAll("[s:federation]", "[s:club]").replaceAll("[s:daily]", "[s:paper]");
    });
    expect(codes(store, "jonas-keller")).toContain("near-duplicate");
  });

  it("keeps blocked articles off the site", () => {
    const store = storeWith((s) => {
      s.people.find((p) => p.data.id === "ana-ferreira")!.articles.en!.meta.reviewer = undefined;
    });
    const ana = store.people.find((p) => p.data.id === "ana-ferreira")!;
    expect(content.liveArticle(ana, "en")).toBeUndefined();
  });
});

describe("publishing rules", () => {
  it("holds future-dated articles until their day", () => {
    const meta = content.readContent().people[0].articles.en!.meta;
    expect(content.isLive({ ...meta, publishedAt: "2999-01-01" })).toBe(false);
    expect(content.isLive({ ...meta, publishedAt: "2000-01-01" })).toBe(true);
    expect(content.isLive({ ...meta, status: "approved" })).toBe(false);
  });
});
