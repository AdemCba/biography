import { site } from "@/config/site";
import { getContent, livePeople, type ContentStore } from "./content";
import { checkContent } from "./quality";

export type Check = { ok: boolean; label: string; detail: string };

/**
 * Pre-flight list before applying to AdSense. Google publishes no minimum page count; the numbers below
 * are our own conservative bar so the site is clearly a real publication, not a stub.
 */
export const MIN_LIVE_PER_LOCALE = 15;

export function adsenseReadiness(store: ContentStore = getContent()): Check[] {
  const checks: Check[] = [];
  const url = site.url;
  checks.push({ ok: !/localhost|example\./.test(url), label: "Real domain configured", detail: url });
  checks.push({ ok: !site.contactEmail.endsWith("example.com"), label: "Working contact address", detail: site.contactEmail });

  const placeholder = store.editors.filter((e) => Object.values(e.i18n).some((t) => t?.bio.startsWith("Replace this")));
  checks.push({
    ok: store.editors.length > 0 && placeholder.length === 0,
    label: "Named editors with real bios (E-E-A-T)",
    detail: placeholder.length ? `Placeholder bio: ${placeholder.map((e) => e.id).join(", ")}` : `${store.editors.length} editor(s)`,
  });
  for (const locale of site.locales) {
    const missing = store.editors.filter((e) => !e.i18n[locale]).map((e) => e.id);
    if (missing.length) checks.push({ ok: false, label: `Editor bios in ${locale}`, detail: `Missing: ${missing.join(", ")}` });
  }

  for (const locale of site.locales) {
    const n = livePeople(locale, store).length;
    checks.push({ ok: n >= MIN_LIVE_PER_LOCALE, label: `Enough live biographies (${locale})`, detail: `${n} / ${MIN_LIVE_PER_LOCALE}` });
  }

  const { reports } = checkContent(store);
  const blocked = reports.filter((r) => r.status === "published" && r.issues.some((i) => i.level === "error"));
  checks.push({
    ok: blocked.length === 0,
    label: "No published article failing the quality gate",
    detail: blocked.map((r) => `${r.personId}/${r.locale}`).join(", ") || "all clear",
  });
  const flagged = reports.filter((r) => store.people.find((p) => p.data.id === r.personId)?.articles[r.locale]?.meta.flag);
  checks.push({ ok: flagged.length === 0, label: "No articles waiting on a human after the fix loop", detail: `${flagged.length} flagged` });

  checks.push({ ok: !!site.adsenseClient, label: "AdSense publisher id set (needed for site verification)", detail: site.adsenseClient || "NEXT_PUBLIC_ADSENSE_CLIENT empty" });
  checks.push({ ok: !!site.googleVerification, label: "Search Console verification", detail: site.googleVerification ? "meta tag set" : "or verify by DNS record instead" });
  checks.push({
    ok: false,
    label: "Consent banner (manual step)",
    detail: "AdSense > Privacy & messaging: create a GDPR message (EEA/UK/CH). Mark this done yourself.",
  });
  return checks;
}
