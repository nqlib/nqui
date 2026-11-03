/**
 * Static tripwires for the "silently dropped styling" bug family:
 *
 * 1. Tailwind arbitrary-value syntax pasted into raw CSS — e.g. the 0.8.0
 *    checkbox bug where `var(--ease-[var(--ease-in-out)])` made every
 *    transition declaration parse-fail and vanish with no error anywhere.
 * 2. Utility class names built with template interpolation — the consumer's
 *    Tailwind scanner only sees literal strings, so `gap-<n>` built at
 *    runtime generates no CSS unless the literal happens to exist elsewhere.
 *
 * 3. Per-instance <style> injection in shipping components — duplicates a whole
 *    stylesheet per rendered instance and folds the CSS text into the
 *    containing element's textContent. Component CSS belongs in
 *    src/styles/*.css, which ships via "@nqlib/nqui/styles".
 *
 * All fail silently in every toolchain gate (tsc, vite, vitest, tailwind),
 * which is why they must be caught here at the source level.
 */
import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"

const SRC = path.resolve(__dirname, "..")

function walk(dir: string, files: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, files)
    else if (/\.(css|tsx?)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) files.push(p)
  }
  return files
}

const files = walk(SRC)

describe("css sanity", () => {
  it("no malformed custom-property names (Tailwind bracket syntax inside var())", () => {
    const bad: string[] = []
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        if (/var\(\s*--[A-Za-z0-9_-]*\[/.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `var(--…[…]) is not a valid custom-property name; the whole declaration is silently dropped:\n${bad.join("\n")}`).toEqual([])
  })

  it("no Tailwind ease-[...] syntax inside raw CSS transition declarations", () => {
    const bad: string[] = []
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        // raw-CSS declaration shape: "transition: … ease-[…]" (className strings
        // never contain "transition:" with a space-separated value list)
        if (/transition\s*:[^;"']*ease-\[/.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `ease-[…] is Tailwind syntax, not a CSS <easing-function>; the declaration is silently dropped:\n${bad.join("\n")}`).toEqual([])
  })

  it("no utility classes built with template interpolation", () => {
    const UTILITY = /`(?:[^`]*[\s"'])?(?:gap|p|px|py|pl|pr|pt|pb|m|mx|my|ml|mr|mt|mb|w|h|size|text|rounded|duration|delay|z|inset|top|left|right|bottom|border|bg|opacity)-\$\{/
    const bad: string[] = []
    for (const f of files) {
      if (f.endsWith(".css")) continue
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        if (UTILITY.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `runtime-constructed utility classes are invisible to the consumer's Tailwind scanner (use an inline style or a static class map):\n${bad.join("\n")}`).toEqual([])
  })

  it("no per-instance <style> injection in shipping components", () => {
    // sonner.tsx is exempt: it uses the correct ID-guarded singleton
    // (injectToastStylesOnce) because it must restyle a third-party portal.
    // debug/ is exempt: dev-only subpath with genuinely dynamic CSS.
    const EXEMPT = /(\/ui\/sonner\.tsx|\/debug\/)/
    const bad: string[] = []
    for (const f of files) {
      if (f.endsWith(".css") || EXEMPT.test(f)) continue
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        if (/<style[\s>]/.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `component CSS belongs in src/styles/*.css (shipped via @nqlib/nqui/styles); a per-instance <style> duplicates the sheet per instance and pollutes textContent:\n${bad.join("\n")}`).toEqual([])
  })

  it("no hardcoded rgba() shadow utilities in shipping components", () => {
    // Shadows come from src/styles/shadows.css tokens (--shadow-thumb, --shadow-pressed, …)
    // so light/dark and the warm hue stay in one place. debug/ is exempt (dev-only).
    const bad: string[] = []
    for (const f of files) {
      if (f.endsWith(".css") || /\/debug\//.test(f)) continue
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        if (/shadow-\[[^\]]*rgba\(/.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `use a shadow token, e.g. shadow-[var(--shadow-thumb)]:\n${bad.join("\n")}`).toEqual([])
  })

  it("no colour function wrapped around a token var()", () => {
    // nqui colour tokens hold complete oklch() values, so oklch(var(--primary)) is invalid and
    // the declaration silently drops (ColorSlider shipped a transparent range this way).
    const bad: string[] = []
    for (const f of files) {
      const src = fs.readFileSync(f, "utf8")
      src.split("\n").forEach((ln, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return
        if (/\b(oklch|hsl|rgb)a?\(\s*var\(--/.test(ln)) bad.push(`${path.relative(SRC, f)}:${i + 1}  ${ln.trim()}`)
      })
    }
    expect(bad, `use var(--token) directly:\n${bad.join("\n")}`).toEqual([])
  })

  it("control tokens are defined in both themes", () => {
    const split = (file: string) => {
      const src = fs.readFileSync(path.join(SRC, file), "utf8")
      const at = src.search(/^\s*\.dark\s*\{/m)
      expect(at, `${file} has a .dark block`).toBeGreaterThan(0)
      return [src.slice(0, at), src.slice(at)] as const
    }
    const [lightIdx, darkIdx] = split("index.css")
    for (const t of ["--track", "--track-hover", "--thumb"]) {
      expect(lightIdx, `${t} in :root`).toMatch(new RegExp(`^\\s*${t}:`, "m"))
      expect(darkIdx, `${t} in .dark`).toMatch(new RegExp(`^\\s*${t}:`, "m"))
    }
    const [lightSh, darkSh] = split("styles/shadows.css")
    expect(lightSh).toMatch(/^\s*--shadow-thumb:/m)
    expect(darkSh).toMatch(/^\s*--shadow-thumb:/m)
    expect(lightSh).toMatch(/^\s*--shadow-pressed:/m)
  })
})
