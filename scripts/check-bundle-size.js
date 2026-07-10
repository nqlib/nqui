#!/usr/bin/env node
/**
 * Bundle-size budget check (zero dependencies).
 *
 * Measures the gzipped size of each published ESM entry against a budget and
 * exits non-zero if any entry exceeds it. Run after `build:lib`. Keeps the
 * bundle-size story honest: a regression fails CI instead of shipping silently.
 *
 * Usage:
 *   node scripts/check-bundle-size.js          # enforce budgets
 *   node scripts/check-bundle-size.js --print  # just print the table
 */
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

// Gzipped KB budgets per entry. Set with ~15% headroom over current sizes so
// normal churn passes but a heavy dep sneaking in trips the check.
const BUDGETS = {
  "nqui.es.js": 95,
  "command.es.js": 5,
  "sonner.es.js": 5,
  "drawer.es.js": 5,
  "carousel.es.js": 5,
  "calendar.es.js": 5,
  "sortable.es.js": 5,
  "debug.es.js": 5,
};

const printOnly = process.argv.includes("--print");
const kb = (bytes) => bytes / 1024;

let failed = false;
const rows = [];

for (const [file, budget] of Object.entries(BUDGETS)) {
  const path = resolve(dist, file);
  if (!existsSync(path)) {
    console.error(`✗ missing built entry: ${file} (run "npm run build:lib" first)`);
    failed = true;
    continue;
  }
  const raw = readFileSync(path);
  const gzip = kb(gzipSync(raw).length);
  const over = !printOnly && gzip > budget;
  if (over) failed = true;
  rows.push({
    file,
    raw: kb(raw.length).toFixed(1),
    gzip: gzip.toFixed(1),
    budget,
    status: printOnly ? "" : over ? "OVER" : "ok",
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(
  `\n${pad("entry", 18)}${pad("raw KB", 10)}${pad("gzip KB", 10)}${pad("budget", 9)}status`
);
console.log("-".repeat(55));
for (const r of rows) {
  console.log(
    `${pad(r.file, 18)}${pad(r.raw, 10)}${pad(r.gzip, 10)}${pad(r.budget, 9)}${r.status}`
  );
}
console.log("");

if (failed) {
  console.error("Bundle-size check FAILED — an entry exceeded its budget.");
  process.exit(1);
}
console.log("Bundle-size check passed.");
