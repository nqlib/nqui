---
id: ST-025
epic: EP-003
title: ToggleGroup pinned cross axis and layout contract
status: in-progress
priority: must
release: 0.7.3
breaking: false
scope: [src/components/ui/toggle-group.tsx, docs, skills]
api: docs/components/nqui-toggle-group.md
---

# ST-025 — ToggleGroup pinned cross axis and layout contract

As an app author putting a ToggleGroup in a toolbar,
I want the group to own its own row, overflow and gaps,
so that a narrow parent or a selection change never drags the pill out of alignment or reflows the
controls around it.

## Acceptance criteria

- [x] A too-wide group scrolls sideways instead of wrapping: horizontal orientation sets
      `overflow-x-auto`, vertical sets `overflow-y-auto`, and the scrollbar is hidden
      (`[scrollbar-width:none]`, `[&::-webkit-scrollbar]:hidden`).
- [x] The **cross** axis is pinned explicitly — `data-[orientation=horizontal]:overflow-y-hidden`
      and `data-[orientation=vertical]:overflow-x-hidden` — so the items' `hit-area-2` `::before`
      overhang cannot become scrollable content and let the row be dragged out of alignment
      (0.7.3, `4d5f0ba`).
- [x] The group is `w-fit max-w-full` with `items-stretch` and `shrink-0` items, so its box is
      driven by its content and neighbouring toolbar controls are not stretched or squeezed by it.
- [x] Selection is expressed through `data-state=on` fill/shadow only in the segmented and outline
      variants — no border-width or padding change on select, so the pill's height and the items'
      boxes are stable across selection.
- [ ] Changing the selection cannot change any item's measured width, so siblings never shift.
- [x] Segmented look is driven by props, not classes: `spacing={0}` (default) gives one
      `rounded-full border border-input` shell with flush `rounded-none` items and auto separators;
      `spacing>0` drops the shell and the dividers.
- [x] `docs/components/nqui-toggle-group.md` has a "Layout — let the group own it" section with the
      don't/why/do table for `flex-wrap`, `gap-*` and `overflow-*`, and explains why `overflow: clip`
      is not usable (it computes to `hidden` when the other axis is `auto`).
- [x] The same rule is reachable where agents actually read: `docs/nqui-skills/AGENT_PROMPT.md`
      mappings + anti-patterns and the `nqui-components` pre-ship checklist line "No `flex-wrap` /
      `gap-*` / `overflow-*` passed to a ToggleGroup".

## Technical notes

- Root cause of the 0.7.3 bug: per the CSS overflow spec, setting overflow on one axis resolves the
  other from `visible` to `auto`. Pinning both axes explicitly is the fix; the rationale is kept as
  a comment in `toggle-group.tsx` so it is not "cleaned up" later.
- The unticked criterion is a real, current gap: `toggleVariants` applies
  `data-[state=on]:font-bold` on top of the base `font-medium`, so a **text-labelled** item gets
  wider when selected and its siblings shift by a few pixels. Icon-only items are unaffected, and
  the group's `w-fit` means the pill itself also re-measures. No width is reserved for the bold
  state today, and no doc page mentions the effect.
- `ToggleGroupSeparator` stays exported for the `separator={false}` / `spacing>0` cases where the
  auto dividers are off.

## Out of scope

- Toggle's own variants and sizing — EP-002.
- Choosing ToggleGroup over RadioGroup for inline selection — that routing rule is documentation,
  owned by EP-007.
