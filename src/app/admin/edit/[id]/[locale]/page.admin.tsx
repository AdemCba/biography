import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { readContent } from "@/lib/content";
import { checkContent } from "@/lib/quality";
import { RISKS, STATUSES } from "@/lib/schema";
import { saveArticle } from "../../../actions.admin";

export const dynamic = "force-dynamic";

const input = "w-full rounded border border-line bg-white px-2 py-1.5";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export default async function EditArticle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id, locale } = await params;
  const { saved } = await searchParams;
  if (!isLocale(locale)) notFound();
  const store = readContent();
  const person = store.people.find((p) => p.data.id === id);
  if (!person) notFound();
  const article = person.articles[locale];
  const meta = article?.meta;
  const report = checkContent(store).reports.find((r) => r.personId === id && r.locale === locale);
  const faq = (meta?.faq ?? []).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={saveArticle} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="locale" value={locale} />
        <h1 className="text-2xl font-semibold">
          <Link href={`/admin/person/${id}`} className="underline">{person.data.name}</Link> · {locale}
        </h1>
        {saved && <p className="rounded bg-green-50 p-2 text-sm text-green-800">Kaydedildi. Yayına almak için dosyaları commit edip pushla.</p>}
        {meta?.flag && <p className="rounded bg-orange-50 p-2 text-sm text-accent">⚑ {meta.flag}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Başlık (H1)"><input name="title" defaultValue={meta?.title ?? person.data.name} className={input} required /></Field>
          <Field label="URL slug" hint={`/${locale}/<slug>/`}><input name="slug" defaultValue={meta?.slug ?? id} className={input} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></Field>
          <Field label="Meta title" hint="≤ 60 karakter"><input name="metaTitle" defaultValue={meta?.metaTitle ?? ""} className={input} /></Field>
          <Field label="Kısa tanım (knownFor)"><input name="knownFor" defaultValue={meta?.knownFor ?? ""} className={input} /></Field>
        </div>
        <Field label="Meta description" hint="120-160 karakter"><textarea name="metaDescription" defaultValue={meta?.metaDescription ?? ""} rows={2} className={input} /></Field>
        <Field label="Özet (giriş paragrafı)"><textarea name="summary" defaultValue={meta?.summary ?? ""} rows={3} className={input} /></Field>
        <Field label="Metin (Markdown)" hint="Kaynak atfı: [s:kaynak-id] · İç link: [Ad](person:kisi-id) · Bölümler: ## Başlık">
          <textarea name="body" defaultValue={article?.body ?? ""} rows={28} className={`${input} font-mono text-[13px]`} />
        </Field>
        <Field label="SSS" hint="Her soru için 'Q: ...' ve alt satırda 'A: ...', sorular arasında boş satır"><textarea name="faq" defaultValue={faq} rows={6} className={`${input} font-mono text-[13px]`} /></Field>
        <Field label="Hedef aramalar (her satıra bir)"><textarea name="targetQueries" defaultValue={(meta?.targetQueries ?? []).join("\n")} rows={3} className={input} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Durum">
            <select name="status" defaultValue={meta?.status ?? "draft"} className={input}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Risk">
            <select name="risk" defaultValue={meta?.risk ?? "medium"} className={input}>
              {RISKS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Yazar">
            <select name="author" defaultValue={meta?.author ?? ""} className={input}>
              <option value="">—</option>
              {store.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Onaylayan editör">
            <select name="reviewer" defaultValue={meta?.reviewer ?? ""} className={input}>
              <option value="">—</option>
              {store.editors.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Yayın tarihi" hint="İleri tarih = planlı yayın"><input type="date" name="publishedAt" defaultValue={meta?.publishedAt ?? ""} className={input} /></Field>
          <Field label="Son doğrulama"><input type="date" name="reviewedAt" defaultValue={meta?.reviewedAt ?? ""} className={input} /></Field>
          <Field label="Tekrar kontrol tarihi"><input type="date" name="reviewBy" defaultValue={meta?.reviewBy ?? ""} className={input} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="noindex" defaultChecked={meta?.noindex} /> noindex</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button name="intent" value="save" className="rounded border border-line bg-white px-4 py-2">Kaydet</button>
          <button name="intent" value="approve" className="rounded bg-ink px-4 py-2 text-white">Onayla</button>
          <button name="intent" value="publish" className="rounded bg-accent px-4 py-2 text-white">Yayına al</button>
        </div>
      </form>

      <aside className="space-y-3 text-sm">
        <h2 className="font-semibold">Kalite kapısı</h2>
        {report ? (
          <>
            <p className="text-muted">{report.words} kelime · {report.citations} atıf · stil puanı {report.styleScore}</p>
            <ul className="space-y-1">
              {report.issues.map((i, n) => (
                <li key={n} className={i.level === "error" ? "text-accent" : "text-muted"}>
                  {i.level === "error" ? "✗" : "•"} {i.message}
                </li>
              ))}
              {report.issues.length === 0 && <li className="text-green-700">✓ Sorun yok</li>}
            </ul>
          </>
        ) : (
          <p className="text-muted">Henüz dosya yok; kaydedince oluşur.</p>
        )}
        <h2 className="pt-4 font-semibold">Kaynaklar</h2>
        <ul className="space-y-1">
          {person.data.sources.map((s) => (
            <li key={s.id}><code>{s.id}</code> · <a href={s.url} className="underline" target="_blank" rel="noreferrer">{s.publisher}</a></li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
