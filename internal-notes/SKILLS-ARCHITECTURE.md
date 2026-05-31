# nqui Skills Architecture (LLM-Native Documentation)

nqui uses **Cursor/IDE skills** instead of a documentation website. The AI learns from skills and executes install commands and component docs directly.

## Philosophy

- **LLM-native:** Skills teach the AI; the AI teaches the user.
- **Docs in package:** `docs/components/` ships with the npm package. Consumers get `node_modules/@nqlib/nqui/docs/components/`.
- **No doc site:** No need to build or host a docs website. The AI reads markdown from the package.

---

## Skill Package (Injected by `npx @nqlib/nqui init-cursor`)

```
.cursor/
├── rules/
│   └── nqui-components.mdc    # Entry rule (globs: **/*.{ts,tsx})
└── skills/
    ├── nqui-install/
    │   └── SKILL.md           # Install commands, execute in terminal
    └── nqui-components/
        └── SKILL.md           # Points to docs path, file resolution table
```

### 1. nqui-install Skill

**When to load:** User asks to install nqui, set up project, fix missing deps, or run setup commands.

**What it does:**

- Lists install commands in sequence (full, minimal, CSS, peers)
- Tells the AI to **execute** these commands (run in terminal)
- Points to init-css, init-cursor, install-peers with exact usage

**File:** `.cursor/skills/nqui-install/SKILL.md`

### 2. nqui-components Skill

**When to load:** User asks about components, which component to use, how to implement X, or builds UI with nqui.

**What it does:**

- **Always** points the AI to: `node_modules/@nqlib/nqui/docs/components/`
- For "which component": read `README.md` (has use-case tables)
- For "how to use X": read `nqui-<name>.md` (e.g. `nqui-button.md`, `nqui-toggle-group.md`)
- Enforces rules: ToggleGroup for toolbar, RadioGroup for forms only, context-first design

**File resolution:**


| Question                                  | File to read                                              |
| ----------------------------------------- | --------------------------------------------------------- |
| Component index, use cases                | `node_modules/@nqlib/nqui/docs/components/README.md`      |
| Specific component (Button, Toggle, etc.) | `node_modules/@nqlib/nqui/docs/components/nqui-<name>.md` |


**Path for consumers:** `node_modules/@nqlib/nqui/docs/components/`  
**Path for nqui dev (monorepo):** `packages/nqui/docs/components/`

---

## Flow

1. **User:** "Install nqui in my project"
  - AI loads nqui-install skill → runs `npx @nqlib/nqui install-peers`, then `npx @nqlib/nqui init-css`, etc.
2. **User:** "Which component for a view mode toggle?"
  - AI loads nqui-components skill → reads `README.md` → finds ToggleGroup in tables → implements
3. **User:** "How do I use the ToggleGroup?"
  - AI loads nqui-components → reads `nqui-toggle-group.md` → implements from doc
4. **User:** "nqui styles not loading"
  - AI has CSS Setup in rule → adds `@import "@nqlib/nqui/styles"` to main CSS

---

## File Map (docs/components)

All component docs follow `nqui-<name>.md`. The README has the full index with links.


| Category          | Components                                                |
| ----------------- | --------------------------------------------------------- |
| Buttons & Actions | Button, ButtonGroup, Toggle, ToggleGroup                  |
| Forms             | Input, Select, Checkbox, RadioGroup, Switch, Slider, etc. |
| Display           | Badge, Avatar, Card, Alert, Skeleton, etc.                |
| Overlay           | Dialog, Sheet, Drawer, Popover, Tooltip                   |
| Layout            | Sidebar, Tabs, Accordion, Resizable                       |
| Data              | DataTable, Sortable, Pagination                           |
| Code              | CodeBlock, Snippet, CodeEditor (via @nqlib/nqcode)        |


---

## Injection

`npx @nqlib/nqui init-cursor` creates:

- `.cursor/rules/nqui-components.mdc` — Entry rule with globs, install snippet, component rules, skill pointers
- `.cursor/skills/nqui-install/SKILL.md` — Install commands (execute in terminal)
- `.cursor/skills/nqui-components/SKILL.md` — Component docs path and file resolution

Post-install also runs `writeCursorRule()` so skills are auto-injected on install.

---

## Extending

- **New component:** Add `nqui-<name>.md` to `docs/components/`, add row to README tables.
- **New install step:** Update `install.md` template in init-cursor.js, update peer-deps.js.
- **New skill:** Add to `.cursor/skills/nqui/` template, update init-cursor to emit it.

