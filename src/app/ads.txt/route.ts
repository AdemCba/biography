import { site } from "@/config/site";

export const dynamic = "force-static";

/** AdSense requires /ads.txt to list the publisher id once the account is approved. */
export function GET() {
  const pub = site.adsenseClient.replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "# AdSense not configured yet\n";
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
