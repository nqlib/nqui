import { describe, it, expect } from "vitest"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve, join } from "node:path"

/**
 * Build-artifact regression guard.
 *
 * These assertions run against the *built* dist/, not source. They lock in the
 * dependency-hygiene work: heavy or environment-coupling packages must never be
 * inlined into the shipped bundle again. react-router in particular used to be
 * dragged into the debug entry via the Magnifier — this guard fails loudly if
 * that (or anything like it) regresses.
 *
 * Skips itself if dist/ has not been built yet, so `vitest` stays green in a
 * fresh checkout; CI builds first, then runs tests, so the guard is enforced
 * where it matters.
 */

const distDir = resolve(__dirname, "../../dist")
const built = existsSync(distDir)

// Packages that must never appear *inlined* in the bundle. They are either
// showcase-only, build-time, or externalized peers. `import "x"` statements
// referencing externals are fine; what we forbid is the package's source being
// bundled in. We check for module-body signatures rather than the bare name to
// avoid false positives on external import specifiers.
const FORBIDDEN_INLINE: Array<{ pkg: string; signatures: string[] }> = [
  {
    pkg: "react-router / react-router-dom",
    // Router internals, not consumer import specifiers.
    signatures: ["createBrowserRouter", "RouterProvider", "useRoutesImpl", "startTransitionImpl"],
  },
  {
    pkg: "shiki",
    signatures: ["createHighlighterCore", "codeToTokensBase"],
  },
  {
    pkg: "@codesandbox/sandpack-react",
    signatures: ["SandpackProvider", "useSandpack"],
  },
]

function readAllJs(): Array<{ file: string; contents: string }> {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) return walk(full)
      return entry.name.endsWith(".js") ? [full] : []
    })
  return walk(distDir).map((file) => ({ file, contents: readFileSync(file, "utf8") }))
}

describe.skipIf(!built)("dist bundle hygiene", () => {
  const chunks = built ? readAllJs() : []

  it("built at least the primary entry", () => {
    expect(existsSync(join(distDir, "nqui.es.js"))).toBe(true)
  })

  for (const { pkg, signatures } of FORBIDDEN_INLINE) {
    it(`does not inline ${pkg}`, () => {
      const offenders = chunks.filter(({ contents }) =>
        signatures.some((sig) => contents.includes(sig))
      )
      expect(
        offenders.map((o) => o.file),
        `${pkg} appears to be inlined in the bundle`
      ).toEqual([])
    })
  }

  it("never imports react-router from any entry", () => {
    const offenders = chunks.filter(({ contents }) =>
      /["']react-router(-dom)?["']/.test(contents)
    )
    expect(offenders.map((o) => o.file)).toEqual([])
  })

  // The main entry must stay lean: importing `{ Button }` from the package root
  // must not transitively drag in optional peers. Only `cmdk` is allowed (it is
  // a required peer, pulled by the core Combobox). Heavy/optional peers
  // (sonner, vaul, @dnd-kit/*, embla, date-fns, react-day-picker, tanstack table)
  // live behind subpath entries and must NOT be reachable from the root.
  it("main entry only eager-pulls the cmdk required peer", () => {
    const OPTIONAL_PEERS = [
      "sonner",
      "vaul",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/modifiers",
      "@dnd-kit/utilities",
      "embla-carousel-react",
      "date-fns",
      "react-day-picker",
      "@tanstack/react-table",
    ]

    // Walk the static import graph starting from the main entry.
    const importsOf = (src: string) =>
      [...src.matchAll(/\bimport\s*(?:[^;"()]*?\bfrom\s*)?"(\.\/[^"]+\.js)"/g)].map((m) => m[1])
    const peerImported = (src: string, pkg: string) =>
      new RegExp(
        `\\bimport\\s*(?:[^;"()]*?\\bfrom\\s*)?"${pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
      ).test(src)

    const seen = new Set<string>()
    const reached = new Set<string>()
    const stack = [join(distDir, "nqui.es.js")]
    while (stack.length) {
      const file = stack.pop()!
      if (seen.has(file) || !existsSync(file)) continue
      seen.add(file)
      const src = readFileSync(file, "utf8")
      for (const pkg of OPTIONAL_PEERS) if (peerImported(src, pkg)) reached.add(pkg)
      for (const rel of importsOf(src)) stack.push(join(distDir, rel.replace("./", "")))
    }

    expect(
      [...reached],
      "optional peers must not be reachable from the main entry"
    ).toEqual([])
  })
})
