---
id: ST-009
epic: EP-002
title: Enhanced / Core aliasing convention
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/index.ts, src/components/ui, src/components/custom, docs, skills]
api: docs/components/README.md
---

# ST-009 — Enhanced / Core aliasing convention

As an app author importing from `@nqlib/nqui`,
I want the public name to resolve to nqui's opinionated component and the raw shadcn/Radix
primitive to stay reachable as `Core*`,
so that I get the styled default without losing the escape hatch.

## Acceptance criteria

- [x] The convention is implemented in the barrel, not in each component file:
      `src/components/index.ts` re-exports `Enhanced* as <PublicName>` and `<Primitive> as Core*`.
- [x] Button — `EnhancedButton as Button`, `enhancedButtonVariants as buttonVariants`,
      `EnhancedButtonProps as ButtonProps`, plus `Button as CoreButton` (`src/components/ui/button.tsx`).
- [x] Badge — `EnhancedBadge as Badge`, `enhancedBadgeVariants as badgeVariants`,
      `EnhancedBadgeProps as BadgeProps`, plus `Badge as CoreBadge` (`src/components/ui/badge.tsx`).
- [x] Checkbox — `EnhancedCheckbox as Checkbox`, `checkboxVariants`, `EnhancedCheckboxProps as
      CheckboxProps`, plus `Checkbox as CoreCheckbox` (`src/components/ui/checkbox.tsx`).
- [x] Progress — `EnhancedProgress as Progress` from `custom/enhanced-progress`, plus
      `Progress as CoreProgress` from `ui/progress`.
- [x] RadioGroup — `EnhancedRadioGroup as RadioGroup` / `EnhancedRadioGroupItem as RadioGroupItem`
      from `custom/enhanced-radio-group`, plus `CoreRadioGroup` / `CoreRadioGroupItem` from
      `ui/radio-group`.
- [x] The same shape is applied to multi-part components by aliasing every part: DropdownMenu
      (15 parts), Select (10 parts), Combobox (19 exports incl. `useComboboxAnchor`), Tabs, Table
      and ScrollArea each ship a full `Core*` mirror.
- [x] Subpath entries follow the convention too — `src/entries/calendar.ts` exports
      `EnhancedCalendar as Calendar` + `Calendar as CoreCalendar`; `src/entries/sonner.ts` exports
      `Toaster` with `EnhancedToaster` / `CoreToaster` aliases.
- [x] Public type aliases follow the public name (`ButtonProps`, `BadgeProps`, `CheckboxProps`,
      `ProgressProps`, `RadioGroupProps`, `ScrollAreaProps`), so consumers never type against
      `Enhanced*`.

## Technical notes

- `Enhanced*` is the *internal* name. Consumers should never see it in an import; the barrel is
  the single place the mapping happens, which is why component files still export both names.
- `EnhancedButton` degrades gracefully: `variant="outline" | "ghost" | "link"` are not enhanced
  variants, so it delegates to `CoreButton` internally rather than dropping the variant.
- Where there is no enhanced version (Input, Label, Dialog, Sheet, Popover, …) the shadcn component
  is exported under its plain name and there is intentionally no `Core*` twin — adding one would
  imply a difference that does not exist.
- Two components alias for compatibility rather than enhancement: `Table` and `CoreTable` are the
  same `ui/table` primitive, and `EnhancedSonner` / `EnhancedToaster` / `CoreToaster` all point at
  one `Toaster`.

## Out of scope

- Which components get a subpath instead of a main-entry export — EP-005.
- The styling the enhanced variants apply — EP-001 owns the tokens they consume.
