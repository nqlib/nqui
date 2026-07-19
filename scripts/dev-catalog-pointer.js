#!/usr/bin/env node
/**
 * Replaces the old Vite showcase `npm run dev`.
 * Catalog + recipes live in the sibling nqui-showcase app.
 */
const msg = `
@nqlib/nqui — no showcase app in this repo.

  Component catalog & recipes live in the sibling app:

    cd ../nqui-showcase
    pnpm nqui:local    # link this package's dist
    pnpm dev           # open http://localhost:5173/catalog

  Library build:  npm run build:lib
  Tests:          npm run test
`.trim()

console.log(msg)
process.exit(0)
