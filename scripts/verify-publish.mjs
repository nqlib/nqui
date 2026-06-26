#!/usr/bin/env node
/**
 * Pre-publish gate for @nqlib/nqui (repo root is the package).
 */
import { spawnSync } from "node:child_process"
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

console.log("verify:publish — running pre-publish checks\n")

run("npm", ["run", "build:lib"])
run("npm", ["run", "lint"])
run("npm", ["test"])
verifyTarball()

console.log("\nverify:publish — all checks passed")
