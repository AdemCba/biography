"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { t: string; k: string; c: string; u: string };

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchBox({ locale, placeholder, noResults, hint }: { locale: string; placeholder: string; noResults: string; hint: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
    fetch(`/${locale}/search-index.json`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [locale]);

  const results = useMemo(() => {
    const terms = fold(q).split(/\s+/).filter(Boolean);
    if (fold(q).length < 2) return [];
    return items.filter((i) => {
      const hay = fold(`${i.t} ${i.k} ${i.c}`);
      return terms.every((term) => hay.includes(term));
    });
  }, [q, items]);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus
        className="w-full rounded-lg border border-line bg-white px-4 py-3 text-lg outline-none focus:border-ink/40"
      />
      <div className="mt-6" aria-live="polite">
        {fold(q).length < 2 ? (
          <p className="text-muted">{hint}</p>
        ) : results.length === 0 ? (
          <p className="text-muted">{noResults}</p>
        ) : (
          <ul className="divide-y divide-line">
            {results.slice(0, 50).map((r) => (
              <li key={r.u} className="py-3">
                <a href={r.u} className="font-serif text-lg hover:underline">{r.t}</a>
                <p className="text-sm text-muted">{r.k}{r.c && ` · ${r.c}`}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
