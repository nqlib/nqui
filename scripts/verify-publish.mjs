#!/usr/bin/env node
/**
 * Pre-publish gate for @nqlib/nqui (repo root is the package).
 */
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..")

function run(command, args, cwd = pkgDir) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  })
  if (result.status !== 0) {
    console.error(`\nverify:publish — step failed: ${command} ${args.join(" ")}`)
    process.exit(result.status ?? 1)
  }
}

function verifyTarball() {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: pkgDir,
    encoding: "utf8",
    shell: process.platform === "win32",
  })
  if (result.status !== 0) {
    console.error(result.stderr || "npm pack --dry-run failed")
    process.exit(result.status ?? 1)
  }
  const meta = JSON.parse(result.stdout)[0]
  const files = meta.files.map((f) => f.path)
  const required = [
    "README.md",
    "dist/nqui.es.js",
    "dist/nqui.cjs.js",
    "dist/index.d.ts",
    "dist/styles.css",
    "dist/fonts/Satoshi-Variable.woff2",
    "dist/fonts/Satoshi-VariableItalic.woff2",
    "scripts/templates/colors.css",
  ]
  const missing = required.filter((r) => !files.includes(r))
  const leaked = files.filter((f) => f.includes(".."))
  if (missing.length) {
    console.error(`verify:publish — tarball missing required files: ${missing.join(", ")}`)
    process.exit(1)
  }
  if (leaked.length) {
    console.error(`verify:publish — tarball references paths outside package root: ${leaked.join(", ")}`)
    process.exit(1)
  }
  console.log(`verify:publish — tarball OK (${meta.entryCount} files, README + dist present)`)
}

function verifyTabsListDts() {
  const dtsPath = join(pkgDir, "dist/components/custom/enhanced-tabs.d.ts")
  const dts = readFileSync(dtsPath, "utf8")
  if (dts.includes("typeof CoreTabsList")) {
    console.error(
      "verify:publish — EnhancedTabsListProps must not wrap CoreTabsList (drops className/variant/children for consumers)",
    )
    process.exit(1)
  }
  if (!dts.includes("TabsPrimitive.List")) {
    console.error(
      "verify:publish — EnhancedTabsListProps must extend Radix TabsPrimitive.List",
    )
    process.exit(1)
  }
  console.log("verify:publish — TabsList public types extend Radix List (not CoreTabsList)")
}

console.log("verify:publish — running pre-publish checks\n")

run("npm", ["run", "build:lib"])
verifyTabsListDts()
run("npm", ["run", "lint"])
run("npm", ["test"])
verifyTarball()

console.log("\nverify:publish — all checks passed")
