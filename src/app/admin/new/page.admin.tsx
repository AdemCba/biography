import { ALL_LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { readContent } from "@/lib/content";
import { createPerson } from "../actions.admin";

export const dynamic = "force-dynamic";

export default function NewPerson() {
  const { categories } = readContent();
  return (
    <form action={createPerson} className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Yeni kişi</h1>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Ad soyad</span>
        <input name="name" required className="w-full rounded border border-line bg-white px-2 py-1.5" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Kategori</span>
        <select name="category" className="w-full rounded border border-line bg-white px-2 py-1.5">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.i18n.en?.name ?? c.id}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Önem (1 niş, 5 dünyaca ünlü)</span>
        <input type="number" name="importance" min={1} max={5} defaultValue={3} className="w-24 rounded border border-line bg-white px-2 py-1.5" />
      </label>
      <fieldset className="text-sm">
        <legend className="mb-1 font-medium">Diller</legend>
        {ALL_LOCALES.map((l) => (
          <label key={l} className="mr-4 inline-flex items-center gap-1">
            <input type="checkbox" name={`locale-${l}`} defaultChecked={l === "en"} /> {LOCALE_NAMES[l]}
          </label>
        ))}
      </fieldset>
      <button className="rounded bg-ink px-4 py-2 text-white">Oluştur</button>
    </form>
  );
}
