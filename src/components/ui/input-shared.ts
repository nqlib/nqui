/**
 * Shared shell for `Input` and `InputGroup` so single-line fields look the same.
 * Block-aligned addons (e.g. textarea labels) override height via `InputGroup` classes.
 */
export const inputFieldShellBase =
  "w-full min-w-0 rounded-md border border-input bg-background ring-offset-background transition-[color,box-shadow]"

export const inputFieldSingleRowHeight = "h-7"
