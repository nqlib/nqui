#!/usr/bin/env node
/**
 * Install the packed nqui tarball into sibling nqui-showcase and run `pnpm typecheck`.
 * Restores package.json + pnpm-lock.yaml afterwards.
 *
 * This is the Vercel-shaped gate (`fumadocs-mdx && tsc -b`) against the files npm
 * would ship — not `link:../nqui` source types. Requires ../nqui-showcase.
 */
import { spawnSync } from "node:child_process"
import { copyFileSync, existsSync, mkdtempSync, rmSync, unlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { verifyConsumerTypes } from "./verify-consumer-types.mjs"

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const showcaseDir = resolve(process.env.NQUI_SHOWCASE_DIR ?? join(pkgDir, "..", "nqui-showcase"))

function run(command, args, cwd, inherit = true) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  })
  if (result.status !== 0) {
    if (!inherit) process.stderr.write(result.stderr || result.stdout || "")
    const err = new Error(`prove-showcase — failed: ${command} ${args.join(" ")}`)
    err.status = result.status ?? 1
    throw err
  }
  return result
}

function packTarball() {
  const result = run("npm", ["pack", "--json"], pkgDir, false)
  const meta = JSON.parse(result.stdout)
  const entry = Array.isArray(meta) ? meta[0] : meta
  const filename = entry.filename || entry
  return join(pkgDir, filename)
}

if (!existsSync(join(showcaseDir, "package.json"))) {
  console.error(`prove-showcase — nqui-showcase not found at ${showcaseDir}`)
  console.error("Set NQUI_SHOWCASE_DIR or clone the sibling repo.")
  process.exit(1)
}

console.log("prove-showcase — packed consumer types first")
verifyConsumerTypes()

if (!existsSync(join(pkgDir, "dist/index.d.ts"))) {
  console.error("prove-showcase — dist missing; run pnpm build:lib")
  process.exit(1)
}

const tarballPath = packTarball()
const backupDir = mkdtempSync(join(tmpdir(), "nqui-showcase-prove-"))
const pkgBackup = join(backupDir, "package.json")
const lockBackup = join(backupDir, "pnpm-lock.yaml")
const showcasePkg = join(showcaseDir, "package.json")
const showcaseLock = join(showcaseDir, "pnpm-lock.yaml")

copyFileSync(showcasePkg, pkgBackup)
if (existsSync(showcaseLock)) copyFileSync(showcaseLock, lockBackup)

let exitStatus = 0
try {
  console.log(`prove-showcase — pnpm add ${tarballPath} in nqui-showcase`)
  run("pnpm", ["add", tarballPath, "--ignore-scripts"], showcaseDir)
  console.log("prove-showcase — pnpm typecheck (same tsc -b as Vercel)")
  run("pnpm", ["typecheck"], showcaseDir)
  console.log("prove-showcase — showcase tsc passed against packed tarball")
} catch (error) {
  console.error(error.message)
  exitStatus = error.status ?? 1
} finally {
  copyFileSync(pkgBackup, showcasePkg)
  if (existsSync(lockBackup)) copyFileSync(lockBackup, showcaseLock)
  rmSync(backupDir, { recursive: true, force: true })
  if (existsSync(tarballPath)) unlinkSync(tarballPath)
  console.log("prove-showcase — restored showcase package.json + lockfile")
  try {
    run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts"], showcaseDir)
  } catch (error) {
    console.error(error.message)
    exitStatus = exitStatus || error.status || 1
  }
}

if (exitStatus) process.exit(exitStatus)
