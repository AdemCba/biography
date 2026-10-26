/** npm run readiness: AdSense / launch pre-flight checklist. */
import { readContent } from "../src/lib/content";
import { adsenseReadiness } from "../src/lib/readiness";

for (const c of adsenseReadiness(readContent())) console.log(`${c.ok ? "✓" : "✗"} ${c.label}: ${c.detail}`);
