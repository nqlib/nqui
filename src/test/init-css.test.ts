import { describe, it, expect, afterEach } from "vitest"
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"
import { generateSetupContent } from "../../scripts/setup-helper.js"

describe("init-css", () => {
  let tempDir: string

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it("creates nqui/index.css and nqui/colors.css with expected imports", () => {
    tempDir = mkdtempSync(join(tmpdir(), "nqui-init-"))
    const script = join(process.cwd(), "scripts/init-css.js")
    const result = spawnSync("node", [script, "--force"], {
      cwd: tempDir,
      encoding: "utf8",
    })

    expect(result.status, result.stderr || result.stdout).toBe(0)

    const indexPath = join(tempDir, "nqui/index.css")
    const colorsPath = join(tempDir, "nqui/colors.css")

    expect(existsSync(indexPath)).toBe(true)
    expect(existsSync(colorsPath)).toBe(true)

    const indexCss = readFileSync(indexPath, "utf8")
    const colorsCss = readFileSync(colorsPath, "utf8")

    expect(indexCss).toContain('@import "@nqlib/nqui/styles";')
    expect(indexCss).toContain('@import "./colors.css";')
    expect(colorsCss).toContain("oklch(0.52 0.20 240)")
  })

  it("setup helper imports brand colors after package styles for vite", () => {
    const setup = generateSetupContent("vite", "nqui/index.css", true)
    expect(setup).toContain('@import "@nqlib/nqui/styles";')
    expect(setup).toContain('@import "../nqui/colors.css";')
  })
})
