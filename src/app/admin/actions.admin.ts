"use server";

import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ALL_LOCALES, isLocale } from "@/i18n/config";
import { writeArticle, writePerson } from "@/lib/article-file";
import { PEOPLE_DIR, readContent, today } from "@/lib/content";
import { articleSchema, personSchema, RISKS, STATUSES } from "@/lib/schema";
import { slugify } from "@/lib/slug";

// The admin only runs under `next dev` (see next.config.ts), but refuse to write anywhere else regardless.
function assertDev() {
  if (process.env.NODE_ENV === "production") throw new Error("Admin is only available in development");
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function parseFaq(raw: string): { q: string; a: string }[] {
  // Format: one block per question, "Q: ..." line followed by "A: ..." line, blocks separated by a blank line.
  return raw
    .split(/\n\s*\n/)
    .map((block) => ({
      q: block.match(/^Q:\s*(.+)$/m)?.[1]?.trim() ?? "",
      a: block.match(/^A:\s*([\s\S]+)$/m)?.[1]?.trim() ?? "",
    }))
    .filter((f) => f.q && f.a);
}

export async function saveArticle(form: FormData) {
  assertDev();
  const id = String(form.get("id"));
  const locale = String(form.get("locale"));
  if (!isLocale(locale)) throw new Error("Bad locale");
  const intent = String(form.get("intent") ?? "save");
  const store = readContent();
  const person = store.people.find((p) => p.data.id === id);
  if (!person) throw new Error("Unknown person");
  const file = path.join(person.dir, `${locale}.md`);
  const prev = person.articles[locale]?.meta;

  let status = String(form.get("status")) as (typeof STATUSES)[number];
  const reviewer = String(form.get("reviewer") || "") || undefined;
  let publishedAt = String(form.get("publishedAt") || "") || undefined;
  let reviewedAt = String(form.get("reviewedAt") || "") || prev?.reviewedAt;
  let flag = prev?.flag;
  if (intent === "approve") {
    status = "approved";
    reviewedAt = today();
    flag = undefined;
  }
  if (intent === "publish") {
    status = "published";
    publishedAt ||= today();
    reviewedAt ||= today();
    flag = undefined;
  }

  const meta = articleSchema.parse({
    ...(prev ?? {}),
    title: form.get("title"),
    slug: form.get("slug"),
    metaTitle: String(form.get("metaTitle") || "") || undefined,
    metaDescription: form.get("metaDescription"),
    knownFor: form.get("knownFor"),
    summary: form.get("summary"),
    status,
    risk: (RISKS as readonly string[]).includes(String(form.get("risk"))) ? form.get("risk") : "medium",
    author: String(form.get("author") || "") || undefined,
    reviewer,
    publishedAt,
    reviewedAt,
    reviewBy: String(form.get("reviewBy") || "") || undefined,
    updatedAt: prev?.status === "published" ? today() : prev?.updatedAt,
    targetQueries: lines(form.get("targetQueries")),
    faq: parseFaq(String(form.get("faq") ?? "")),
    noindex: form.get("noindex") === "on",
    flag,
  });
  writeArticle(file, meta, String(form.get("body") ?? ""));
  revalidatePath("/admin");
  redirect(`/admin/edit/${id}/${locale}?saved=1`);
}

export async function savePerson(form: FormData) {
  assertDev();
  const id = String(form.get("id"));
  const parsed = personSchema.safeParse(JSON.parse(String(form.get("json"))));
  if (!parsed.success) redirect(`/admin/person/${id}?error=${encodeURIComponent(parsed.error.message.slice(0, 400))}`);
  if (parsed.data.id !== id) redirect(`/admin/person/${id}?error=${encodeURIComponent("id cannot change")}`);
  writePerson(path.join(PEOPLE_DIR, id, "person.json"), parsed.data);
  redirect(`/admin/person/${id}?saved=1`);
}

export async function createPerson(form: FormData) {
  assertDev();
  const name = String(form.get("name")).trim();
  const id = slugify(name);
  if (!id) throw new Error("Name required");
  const dir = path.join(PEOPLE_DIR, id);
  if (fs.existsSync(dir)) redirect(`/admin/person/${id}`);
  fs.mkdirSync(dir, { recursive: true });
  writePerson(
    path.join(dir, "person.json"),
    personSchema.parse({ id, name, categories: [String(form.get("category"))], importance: Number(form.get("importance") || 3) }),
  );
  for (const locale of ALL_LOCALES) {
    if (form.get(`locale-${locale}`) === "on") {
      writeArticle(path.join(dir, `${locale}.md`), { title: name, slug: id, status: "idea", risk: "medium" }, "");
    }
  }
  redirect(`/admin/person/${id}`);
}
