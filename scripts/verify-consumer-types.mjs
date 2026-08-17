#!/usr/bin/env node
/**
 * Typecheck a tiny consumer against the *packed tarball* `.d.ts`, not source.
 *
 * Library tests and `pnpm nqui:local` see implementation types. Vercel / npm
 * consumers see emitted declarations. Wrapping `ComponentProps<typeof CoreX>`
 * can pass in-repo and fail after publish (TabsList, 0.7.8–0.7.9).
 *
 * Requires `dist/` from `build:lib`. No network.
 */
import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const fixturePath = join(pkgDir, "scripts/fixtures/consumer-app.tsx")
const tscBin = join(pkgDir, "node_modules/.bin/tsc")

function run(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    cwd: pkgDir,
    encoding: "utf8",
    shell: process.platform === "win32",
    ...opts,
  })
  if (result.status !== 0) {
    const detail = result.stderr || result.stdout || ""
    console.error(detail)
    console.error(`\nverify:consumer-types — failed: ${command} ${args.join(" ")}`)
    process.exit(result.status ?? 1)
  }
  return result
}

function packFilename() {
  const result = run("npm", ["pack", "--json"], { stdio: ["ignore", "pipe", "pipe"] })
  const meta = JSON.parse(result.stdout)
  const entry = Array.isArray(meta) ? meta[0] : meta
  const filename = entry.filename || entry
  if (typeof filename !== "string" || !filename.endsWith(".tgz")) {
    console.error("verify:consumer-types — npm pack --json did not return a tarball name")
    process.exit(1)
  }
  return filename
}

function linkDeps(fromModules, toModules, skipNqui = false) {
  mkdirSync(toModules, { recursive: true })
  for (const name of readdirSync(fromModules)) {
    if (name.startsWith(".")) continue
    const from = join(fromModules, name)
    const to = join(toModules, name)
    if (name === "@nqlib") {
      mkdirSync(to, { recursive: true })
      for (const scoped of readdirSync(from)) {
        if (skipNqui && scoped === "nqui") continue
        const dest = join(to, scoped)
        if (!existsSync(dest)) symlinkSync(join(from, scoped), dest)
      }
      continue
    }
    if (!existsSync(to)) symlinkSync(from, to)
  }
}

function verifyTabsListInterface(extractedPkg) {
  const dtsPath = join(extractedPkg, "dist/components/custom/enhanced-tabs.d.ts")
  const dts = readFileSync(dtsPath, "utf8")
  const iface = dts.match(/export interface EnhancedTabsListProps[\s\S]*?\n\}/)?.[0] ?? ""
  if (!iface) {
    console.error("verify:consumer-types — EnhancedTabsListProps missing from packed .d.ts")
    process.exit(1)
  }
  if (iface.includes("CoreTabsList")) {
    console.error(
      "verify:consumer-types — EnhancedTabsListProps must not wrap CoreTabsList (drops consumer props)",
    )
    process.exit(1)
  }
  if (!iface.includes("TabsPrimitive.List")) {
    console.error(
      "verify:consumer-types — EnhancedTabsListProps must extend Radix TabsPrimitive.List",
    )
    process.exit(1)
  }
  if (!/variant\??:/.test(iface)) {
    console.error("verify:consumer-types — EnhancedTabsListProps must declare variant")
    process.exit(1)
  }
}

export function verifyConsumerTypes() {
  if (!existsSync(join(pkgDir, "dist/index.d.ts"))) {
    console.error("verify:consumer-types — dist/index.d.ts missing; run build:lib first")
    process.exit(1)
  }
  if (!existsSync(tscBin)) {
    console.error("verify:consumer-types — typescript not installed (node_modules/.bin/tsc)")
    process.exit(1)
  }

  const filename = packFilename()
  const tarballPath = join(pkgDir, filename)
  const tmp = mkdtempSync(join(tmpdir(), "nqui-consumer-"))

  try {
    run("tar", ["-xzf", tarballPath, "-C", tmp])
    const extractedPkg = join(tmp, "package")
    verifyTabsListInterface(extractedPkg)

    const consumer = join(tmp, "consumer")
    mkdirSync(join(consumer, "node_modules", "@nqlib"), { recursive: true })
    symlinkSync(extractedPkg, join(consumer, "node_modules", "@nqlib", "nqui"))
    linkDeps(join(pkgDir, "node_modules"), join(consumer, "node_modules"), true)

    writeFileSync(join(consumer, "app.tsx"), readFileSync(fixturePath, "utf8"))
    writeFileSync(
      join(consumer, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
            jsx: "react-jsx",
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            verbatimModuleSyntax: true,
          },
          include: ["app.tsx"],
        },
        null,
        2,
      ),
    )

    run(tscBin, ["-p", consumer, "--pretty", "false"], { cwd: consumer, stdio: "inherit" })
    console.log("verify:consumer-types — packed TabsList types accept children, className, variant")
  } finally {
    rmSync(tmp, { recursive: true, force: true })
    if (existsSync(tarballPath)) unlinkSync(tarballPath)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyConsumerTypes()
}
