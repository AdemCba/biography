/**
 * Runs before `next build`:
 *  - removes types left by the admin dev server (they mention dev-only routes and break the type check)
 *  - writes small WebP copies of the photos (scripts/thumbs.ts)
 *  - prints the quality report (failing articles are excluded from the build, not fatal)
 */
import fs from "node:fs";

fs.rmSync(".next/dev", { recursive: true, force: true });
await import("./thumbs");
await import("./check-content");
