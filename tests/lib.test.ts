import { describe, expect, it } from "vitest";
import { ageOn, resolveShortcuts, splitBeforeHeading } from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import { similarity, styleFindings } from "@/lib/style";
import { changedUrls } from "../scripts/indexnow";

describe("slugify", () => {
  it("strips accents and punctuation", () => {
    expect(slugify("Kylian Mbappé")).toBe("kylian-mbappe");
    expect(slugify("Thomas Müller")).toBe("thomas-muller");
    expect(slugify("  São Paulo F.C. ")).toBe("sao-paulo-f-c");
  });
});

describe("markdown shortcuts", () => {
  const sources = [
    { id: "a", url: "https://x.org", title: "A", publisher: "P", type: "press" as const, accessed: "2026-01-01" },
    { id: "b", url: "https://y.org", title: "B", publisher: "P", type: "official" as const, accessed: "2026-01-01" },
  ];
  it("numbers citations by source order and resolves person links", () => {
    const out = resolveShortcuts("Fact [s:b]. See [Jo](person:jo) and [Al](person:al).", sources, (id) => (id === "jo" ? "/en/jo/" : undefined));
    expect(out).toBe("Fact [[2]](#src-b). See [Jo](/en/jo/) and Al.");
  });
  it("splits before the second section", () => {
    const [a, b] = splitBeforeHeading("intro\n\n## One\n\ntext\n\n## Two\n\nmore", 2);
    expect(a).toContain("## One");
    expect(b.startsWith("## Two")).toBe(true);
  });
  it("computes age", () => {
    expect(ageOn("1994-03-12", "2026-03-11")).toBe(31);
    expect(ageOn("1994-03-12", "2026-03-12")).toBe(32);
  });
});

describe("style heuristics", () => {
  it("catches clichés in other languages", () => {
    expect(styleFindings("Sin lugar a dudas, un verdadero icono.", "es").map((f) => f.code)).toContain("cliche");
    expect(styleFindings("Zusammenfassend war er eine wahre Ikone.", "de").map((f) => f.code)).toContain("cliche");
  });
  it("scores identical texts as duplicates", () => {
    const t = "one two three four five six seven eight nine ten eleven twelve";
    expect(similarity(t, t)).toBe(1);
    expect(similarity(t, "completely different words that share nothing at all with it")).toBe(0);
  });
});

describe("IndexNow diff", () => {
  const xml = (entries: [string, string][]) =>
    entries.map(([u, d]) => `<url><loc>${u}</loc><lastmod>${d}</lastmod></url>`).join("");
  it("submits new and updated URLs only", () => {
    const before = xml([["https://s/en/a/", "2026-01-01"], ["https://s/en/b/", "2026-01-01"]]);
    const after = xml([["https://s/en/a/", "2026-01-01"], ["https://s/en/b/", "2026-02-01"], ["https://s/en/c/", "2026-02-01"]]);
    expect(changedUrls(before, after)).toEqual(["https://s/en/b/", "https://s/en/c/"]);
  });
});

describe("review agent decision", async () => {
  const { decide } = await import("../scripts/review");
  const base = {
    claims: [{ claim: "Born 1986", sourceIds: ["a"], verdict: "confirmed" as const, note: "" }],
    uncitedClaims: [],
    readsHumanWritten: true,
    addsValue: true,
    valueNote: "",
    decision: "approve" as const,
    summary: "",
  };
  it("approves only a clean verdict", () => {
    expect(decide(base).approved).toBe(true);
  });
  it("rejects wrong claims even if the model says approve", () => {
    const v = { ...base, claims: [...base.claims, { claim: "9 golds", sourceIds: ["a"], verdict: "wrong" as const, note: "8 after 2017" }] };
    expect(decide(v).approved).toBe(false);
  });
  it("rejects uncited claims, robotic prose and no added value", () => {
    expect(decide({ ...base, uncitedClaims: ["x"] }).approved).toBe(false);
    expect(decide({ ...base, readsHumanWritten: false }).approved).toBe(false);
    expect(decide({ ...base, addsValue: false }).approved).toBe(false);
  });
});
