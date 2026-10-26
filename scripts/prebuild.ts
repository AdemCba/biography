/**
 * Runs before `next build`:
 *  - removes types left by the admin dev server (they mention dev-only routes and break the type check)
 *  - prints the quality report (failing articles are excluded from the build, not fatal)
 */
import fs from "node:fs";

fs.rmSync(".next/dev", { recursive: true, force: true });
await import("./check-content");
