import Link from "next/link";
import { readContent, today } from "@/lib/content";
import { checkContent } from "@/lib/quality";
import { adsenseReadiness } from "@/lib/readiness";
import { STATUSES } from "@/lib/schema";

export const dynamic = "force-dynamic";

const STATUS_TR: Record<string, string> = {
  idea: "Fikir", research: "Araştırma", draft: "Taslak", review: "İncelemede", approved: "Onaylı", published: "Yayında",
};

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { view, status, problems } = await searchParams;
  const store = readContent();
  const { reports, issues } = checkContent(store);

  if (view === "readiness") {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-semibold">AdSense başvuru hazırlığı</h1>
        <ul className="space-y-2">
          {adsenseReadiness(store).map((c) => (
            <li key={c.label} className="rounded border border-line bg-white p-3">
              <span className={c.ok ? "text-green-700" : "text-accent"}>{c.ok ? "✓" : "✗"}</span> {c.label}
              <div className="text-sm text-muted">{c.detail}</div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const rows = reports
    .map((r) => {
      const article = store.people.find((p) => p.data.id === r.personId)!.articles[r.locale]!;
      return { r, meta: article.meta, errors: r.issues.filter((i) => i.level === "error").length, warnings: r.issues.filter((i) => i.level === "warning").length };
    })
    .filter(({ r, meta, errors }) => {
      if (status && r.status !== status) return false;
      if (problems && !errors && !meta.flag) return false;
      if (view === "maintenance") {
        return !!meta.flag || errors > 0 || r.issues.some((i) => ["review-due", "stale-net-worth"].includes(i.code));
      }
      return true;
    });

  const counts = Object.fromEntries(STATUSES.map((s) => [s, reports.filter((r) => r.status === s).length]));
  const scheduled = reports.filter((r) => {
    const m = store.people.find((p) => p.data.id === r.personId)!.articles[r.locale]!.meta;
    return m.status === "published" && m.publishedAt && m.publishedAt > today();
  }).length;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">{view === "maintenance" ? "Bakım: hatalı, eskimiş veya bayraklı içerikler" : "İçerikler"}</h1>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className="rounded border border-line bg-white px-2 py-1">Tümü ({reports.length})</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin?status=${s}`} className="rounded border border-line bg-white px-2 py-1">
            {STATUS_TR[s]} ({counts[s]})
          </Link>
        ))}
        <Link href="/admin?problems=1" className="rounded border border-line bg-white px-2 py-1">Sadece sorunlular</Link>
        <span className="px-2 py-1 text-muted">Planlı yayın: {scheduled}</span>
      </div>
      {issues.length > 0 && (
        <div className="mb-4 rounded border border-accent/40 bg-white p-3 text-sm">
          {issues.map((i, n) => (
            <div key={n}>{i.level === "error" ? "HATA" : "uyarı"} {i.code}: {i.message}</div>
          ))}
        </div>
      )}
      <table className="w-full border-collapse bg-white text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="p-2">Kişi</th><th className="p-2">Dil</th><th className="p-2">Durum</th><th className="p-2">Kelime</th>
            <th className="p-2">Kaynak atfı</th><th className="p-2">Stil puanı</th><th className="p-2">Hata / uyarı</th><th className="p-2">Yayın</th><th className="p-2">Not</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ r, meta, errors, warnings }) => (
            <tr key={`${r.personId}/${r.locale}`} className="border-b border-line">
              <td className="p-2"><Link href={`/admin/person/${r.personId}`} className="underline">{r.personId}</Link></td>
              <td className="p-2"><Link href={`/admin/edit/${r.personId}/${r.locale}`} className="underline">{r.locale}</Link></td>
              <td className="p-2">{STATUS_TR[r.status]}</td>
              <td className="p-2">{r.words}</td>
              <td className="p-2">{r.citations}</td>
              <td className="p-2">{r.styleScore}</td>
              <td className={`p-2 ${errors ? "font-semibold text-accent" : ""}`}>{errors} / {warnings}</td>
              <td className="p-2">{meta.publishedAt ?? "—"}</td>
              <td className="p-2 text-accent">{meta.flag ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="mt-4 text-muted">Liste boş.</p>}
    </section>
  );
}
