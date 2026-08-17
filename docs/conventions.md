# Git conventions — nqui

The single source of truth for branches, commits and releases in this repo. Product-side rules
(stories, statuses, intake) live in
[`docs/product/agentic-coding-guideline.md`](product/agentic-coding-guideline.md).

## Branch topology

| Branch | Contains | Who writes to it |
|---|---|---|
| `main` | **Released versions only**, each tagged `vX.Y.Z` | release merges and hotfixes — never direct work |
| `dev` | Integration branch: everything merged and testable, not yet released | story branches, via PR |
| `<type>/st-NNN-…` | One story | the person or agent implementing it |

**Never commit directly to `main` or `dev`.** Work branches from `dev` and PRs back into `dev`;
`main` only ever moves via a release merge or a hotfix.

```
feat/st-031-kanban-board ─┐
chore/st-043-postinstall ─┼─► dev ──(release: version bump + CHANGELOG)──► main + tag vX.Y.Z
docs/st-056-doc-pages ────┘                                                 │
                                                                            └─ hotfix/<name> ─► main ─► back-merge into dev
```

## Naming

| Item | Format | Example |
|---|---|---|
| Story branch | `<type>/st-NNN-kebab-name` | `feat/st-031-kanban-board` |
| Epic branch (several stories, one branch) | `<type>/ep-NNN-kebab-name` | `feat/ep-004-dnd` |
| Non-story branch (below the story line) | `<type>/kebab-name` | `fix/toggle-focus-ring` |
| Hotfix | `hotfix/kebab-name` | `hotfix/broken-sonner-export` |

`<type>` is one of `feat` · `fix` · `chore` · `refactor` · `docs` · `test`.

## Commits

Conventional commits, with the story ref in parentheses when there is one:

```
feat(dnd): Kanban board with cross-column moves (ST-031)
fix(combobox): multi-select double-click toggle (ST-012)
chore: move the catalog out of the library repo (ST-060)
```

An epic branch still tags each commit with its own story ref. A commit that spans several stories
lists them: `(ST-030..ST-033)` or `(ST-041, ST-042)`.

## Merging

- **Squash-merge into `dev`** — one story, one commit on `dev`.
- **Regular merge `dev` → `main`** at release time, so the release history stays linear and
  bisectable.
- A PR that changes behavior carries its docs and its story update in the same PR.

## Releases

1. On `dev`: bump `version` in `package.json`, write the `CHANGELOG.md` section naming the stories
   the release closes (`- Kanban board primitives (ST-031)`), and any **Migration** lines for
   `breaking: true` stories.
2. `pnpm run verify:publish` (build, packed consumer types, lint, test, tarball).
3. `make prove-showcase` — installs the tarball into sibling nqui-showcase and runs `tsc -b`.
   Do not skip this. In-repo tests do not see the published `.d.ts`.
4. Merge `dev` → `main`, tag `vX.Y.Z` on `main`, push the tag.
5. Publish from `main` (`make publish` already runs prove-showcase when the sibling exists).
   `make publish-next` is a canary tag only; it does not hide the version from `^` ranges.
6. Set the shipped stories to `done` and update their epics' tables.

> Releases 0.7.0–0.7.3 predate this convention: they were committed straight onto `main` and only
> `v0.6.3` is tagged. Tag retroactively if the history is ever needed.

## Hotfix

Branch `hotfix/<name>` from `main`, PR into `main`, tag the patch release, then **merge `main` back
into `dev`** immediately (a regular merge, not `-s ours`) so the branches don't diverge.
