import type { Metadata } from "next";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
import { site } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: { ...(site.googleVerification ? { google: site.googleVerification } : {}), yandex: "7d20264d9b91af0a" },
  other: site.adsenseClient ? { "google-adsense-account": site.adsenseClient } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
