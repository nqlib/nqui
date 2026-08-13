---
id: ST-011
epic: EP-002
title: Form control set
status: done
priority: must
release: pre-baseline
breaking: false
scope: [src/components/ui, src/components/custom, src/components/index.ts, docs]
api: docs/components/nqui-field.md
---

# ST-011 — Form control set

As an app author building a form,
I want text entry, choice and range controls plus the labelling wrapper to come from one entry and
share one visual language,
so that a form does not mix three component vocabularies.

## Acceptance criteria

- [x] Text entry ships from `src/components/index.ts`: `Input`, `Textarea`, `InputGroup` /
      `InputGroupText` / `InputGroupInput` / `InputGroupButton` / `InputGroupAddon` /
      `InputGroupTextarea`, and `InputOTP` / `InputOTPGroup` / `InputOTPSlot` / `InputOTPSeparator`.
- [x] Labelling ships: `Label`, plus `Field` with `FieldGroup` / `FieldLabel` / `FieldDescription` /
      `FieldError` / `FieldLegend` / `FieldSeparator` / `FieldSet` / `FieldContent` / `FieldTitle`.
- [x] Choice controls ship: `Checkbox` (+ `checkboxVariants`, `CoreCheckbox`), `RadioGroup` /
      `RadioGroupItem` (+ `CoreRadioGroup` / `CoreRadioGroupItem`), `Switch` (+ `switchVariants`,
      `switchThumbVariants`, `SwitchProps`).
- [x] Range control ships: `Slider` (+ `sliderTrackVariants`, `sliderThumbVariants`).
- [x] Dropdown selection ships: `Select` (10 parts, with a full `CoreSelect*` mirror) and
      `NativeSelect` / `NativeSelectOptGroup` / `NativeSelectOption`.
- [x] `Input`, `InputGroup`, `Textarea` and `NativeSelect` share sizing/state classes through
      `src/components/ui/input-shared.ts` rather than restating them.
- [x] No control in this set requires an optional peer — `input-otp` is a direct `dependency`, and
      Radix primitives (checkbox, label, select, switch, separator) are direct `dependencies`.
- [x] Doc pages exist for each: `nqui-input.md`, `nqui-textarea.md`, `nqui-input-group.md`,
      `nqui-input-otp.md`, `nqui-label.md`, `nqui-field.md`, `nqui-checkbox.md`,
      `nqui-radio-group.md`, `nqui-switch.md`, `nqui-slider.md`, `nqui-select.md`,
      `nqui-native-select.md`.

## Technical notes

- `Field` is the composition seam: it owns label / description / error placement so individual
  controls stay unaware of validation layout. Controls are never expected to render their own error
  text.
- `RadioGroup` is the *stacked* choice control. Inline / toolbar-style selection must use
  `ToggleGroup` (ST-010) — this is enforced in the consumer skill, not in code.
- `Checkbox`, `Switch` and `Slider` export their `cva` variant functions so app-level wrappers can
  reuse the exact class strings instead of copying them.
- `NativeSelect` exists alongside Radix `Select` for cases where the platform picker is preferable
  (mobile, dense tables); it is not an `Enhanced`/`Core` pair.

## Bugs

- 2026-08-13 — Sliding `RadioGroup` default `--radio-pill-radius` is `var(--radius-md)` (matches
  Tabs / Button) instead of a full capsule. Inner chip uses `outer − 3px` inset. Circular radio
  discs stay `rounded-full`.

## Out of scope

- `Combobox` — ST-012 (searchable select, carries the cmdk dependency).
- `ColorPicker`, `ColorSlider`, `Rating` — ST-014.
- `Calendar` / date entry — ST-013 (subpath).
- Form state, validation libraries, resolvers — nqui ships no form runtime.
