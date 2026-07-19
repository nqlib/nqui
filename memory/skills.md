# memory/ — shared project memory & write-policy

`memory/` is the repo's **version-controlled, tool-shared** memory: durable facts an agent (Claude
Code, Cursor, Codex) or a teammate should know across sessions but that are **not derivable** from
the code, git history, `CLAUDE.md`, `docs/`, or `docs/product/`. This file is the policy — *when,
how, and why* to write — so memory stays small and high-signal.

> **Not the same as Claude Code's built-in memory** (`~/.claude/projects/.../memory/`, machine-local,
> auto-loaded). That one holds *personal* preferences. This one lives in the repo, is shared via git
> and across tools, and is loaded on demand (see Loading).

---

## The bar — write almost never

Before writing, apply the one test that matters:

> **"Would an agent repeat the same mistake or waste the same effort next session without this note?"**
> If **no**, don't write it.

A fact earns a memory file only if **all three** hold:

1. **Durable** — still true in a month, not transient state (current branch, WIP, today's task).
2. **Not derivable** — can't be recovered by reading the code, `git log`, `CLAUDE.md`, `docs/`, or a
   story file.
3. **Reusable** — a *future* session acting on this repo would benefit.

Fail any one → **don't write**. The default outcome of a turn is *no memory written*.

---

## When to write

- The user explicitly says **"remember / save this / note for later"** → capture the durable nugget,
  not the whole conversation.
- A **decision + rationale** that will resurface ("we chose Pragmatic DnD over dnd-kit because …").
- **Library-domain knowledge** that isn't obvious from source — why an API is shaped that way, why a
  peer is optional, a consumer constraint that drove a design.
- A **project constraint / goal / state** not in the repo (an external consumer app, a registry
  quirk, roadmap intent that hasn't become an epic yet).
- A **gotcha that cost real time**, so the next session skips the dead end.

## When NOT to write

- Anything **derivable** from code, `git`, `CLAUDE.md`, `docs/`, or `docs/product/`.
- **Scope, acceptance criteria, or status of work** → that's a story (`docs/product/epics/**`), not a
  memory. Memory never tracks work in flight.
- **One-off** conversation detail, or **transient** state (branch names, WIP, "we're mid-refactor").
- **Restating** a doc or an existing memory → *update the existing one instead*.
- **Speculation** or low-confidence guesses.
- **Secrets** — tokens, `.env` values, npm credentials. Never.
- A **multi-step procedure**, or a rule that only matters in one part of the codebase → that belongs
  in a maintainer skill (`.agents/skills/`) or a `.cursor/rules/` file, not a memory.

---

## Categories (`type` in frontmatter)

| `type` | What belongs | Body shape |
|--------|--------------|-----------|
| `domain` | How the library really works, non-obvious mechanics, API rationale | plain statement |
| `decision` | A choice that was made + why + how to apply it later | **Why:** / **How to apply:** |
| `context` | Ongoing project state / constraints / goals not in the repo | plain statement |
| `convention` | A norm on *how we work* ("always do X this way") | **Why:** / **How to apply:** |
| `reference` | A pointer to an external resource (registry, consumer repo, URL) | link + one line |

---

## How to write

1. **One fact per file** → `memory/<kebab-slug>.md`.
2. **Frontmatter**:
   ```markdown
   ---
   name: <kebab-slug>            # matches the filename
   description: <one line>        # used to judge relevance during recall — make it specific
   type: domain | decision | context | convention | reference
   created: YYYY-MM-DD            # absolute date; flags staleness later
   ---
   ```
3. **Body**: state the fact plainly. For `decision`/`convention` add **Why:** and **How to apply:**
   lines. Convert relative dates ("today") to absolute. Link related memories with `[[slug]]`, and
   link the owning story/epic when there is one.
4. **Keep it tight** — aim **< ~150 words**. Longer than a screen means it's a *doc*: put it in
   `docs/` (or a story's Technical notes) and leave a `reference` memory pointing to it.
5. **Add one line to `INDEX.md`**.
6. **Before creating**: skim `INDEX.md`. **Update** an existing memory rather than duplicating;
   **delete** one that's now wrong. Merge near-duplicates when you notice them.

## How to recall

Read **`INDEX.md`** (cheap — one line each), then open only the `<slug>.md` files whose
`description` matches the task. **Never bulk-read** `memory/`.

---

## Why this shape (token budget)

`INDEX.md` is the only broadly-loaded file — one line per memory — so recall stays cheap; full
memories load lazily, by relevance. **Keep `INDEX.md` under ~200 lines.** Writing rarely is what
keeps the index small and every line worth its tokens.

## Loading

- `CLAUDE.md` routes here; consult `INDEX.md` when a task might benefit from prior context.
- Repo memory is **not** injected into every session automatically — that's deliberate. Read
  `INDEX.md` when it's relevant.
