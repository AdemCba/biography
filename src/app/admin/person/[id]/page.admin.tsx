import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_LOCALES } from "@/i18n/config";
import { readContent } from "@/lib/content";
import { savePerson } from "../../actions.admin";

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const person = readContent().people.find((p) => p.data.id === id);
  if (!person) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{person.data.name}</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        {ALL_LOCALES.map((l) => (
          <Link key={l} href={`/admin/edit/${id}/${l}`} className="rounded border border-line bg-white px-3 py-1.5">
            {l}: {person.articles[l]?.meta.status ?? "oluştur"}
          </Link>
        ))}
      </div>
      {saved && <p className="rounded bg-green-50 p-2 text-sm text-green-800">Kaydedildi.</p>}
      {error && <pre className="whitespace-pre-wrap rounded bg-orange-50 p-2 text-xs text-accent">{error}</pre>}
      <form action={savePerson} className="space-y-2">
        <input type="hidden" name="id" value={id} />
        <p className="text-sm text-muted">
          Kaynaklar, doğrulanmış bilgiler (her biri kaynak id&apos;si ile), kategoriler, görsel ve ilgili kişiler. Şema: src/lib/schema.ts
        </p>
        <textarea name="json" defaultValue={JSON.stringify(person.data, null, 2)} rows={36} className="w-full rounded border border-line bg-white p-2 font-mono text-[13px]" />
        <button className="rounded bg-ink px-4 py-2 text-white">Kaydet</button>
      </form>
    </div>
  );
}
