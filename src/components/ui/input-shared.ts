/**
 * Shared shell for `Input` and `InputGroup` so single-line fields look the same.
 * Block-aligned addons (e.g. textarea labels) override height via `InputGroup` classes.
 */
export const inputFieldShellBase =
  "w-full min-w-0 rounded-md border border-input bg-input/20 dark:bg-input/30 dark:hover:bg-input/50 ring-offset-background transition-[color,background-color,border-color,box-shadow]"

export const inputFieldSingleRowHeight = "h-7"
