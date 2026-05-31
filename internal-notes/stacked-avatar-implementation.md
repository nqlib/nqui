# Stacked Avatar (Assignees) Implementation

Use this pattern to show multiple assignees/people in a project cell with limited space.

## Pattern

1. **Stack avatars** – Use `flex` + `-space-x-1.5` so avatars overlap.
2. **Limit visible** – Show the first `maxVisible` avatars (e.g. 2–3).
3. **Overflow indicator** – When there are more, append a "…" badge.
4. **Hover for details** – Wrap the overflow case in `Tooltip` / `TooltipProvider`; show full list on hover.

## Data Shape

```ts
type Person = { id: string; name: string; avatarUrl?: string }
```

## Key Props

| Prop        | Description                         |
|-------------|-------------------------------------|
| `maxVisible`| How many avatars to show (2–3)      |
| `people`    | Array of `Person` objects           |

## Layout Classes

- Container: `flex shrink-0 items-center -space-x-1.5`
- Avatar: `h-5 w-5 border border-background`
- Fallback: `text-[10px]` for initials
- Overflow badge: Same size as avatar, `bg-muted text-muted-foreground`

## Overflow Logic

```ts
const visible = people.slice(0, maxVisible)
const overflow = people.length > maxVisible
// Render visible + "…" badge when overflow; wrap in Tooltip for hover
```
