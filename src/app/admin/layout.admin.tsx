import Link from "next/link";
import { site } from "@/config/site";
import "../globals.css";

export const metadata = { title: `Panel | ${site.name}`, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-paper text-ink">
        <header className="border-b border-line bg-white">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm">
            <Link href="/admin" className="font-serif text-lg font-semibold">{site.name} panel</Link>
            <Link href="/admin" className="text-muted hover:text-ink">İçerikler</Link>
            <Link href="/admin?view=maintenance" className="text-muted hover:text-ink">Bakım</Link>
            <Link href="/admin?view=readiness" className="text-muted hover:text-ink">AdSense hazırlığı</Link>
            <Link href="/admin/new" className="ml-auto rounded bg-ink px-3 py-1.5 text-white">Yeni kişi</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
