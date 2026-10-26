import type { Metadata } from "next";
import { site } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = { metadataBase: new URL(site.url), title: site.name };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
