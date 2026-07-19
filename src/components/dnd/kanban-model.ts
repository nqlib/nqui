/**
 * Canonical Kanban state model + reconciliation helper.
 *
 * The recommended state shape is `Record<columnId, cardId[]>` — an ordered list
 * of card ids per column. Keep the card *content* in a separate lookup; this
 * model only tracks placement, which is all drag-and-drop needs to mutate.
 */
export type KanbanColumns = Record<string, string[]>;

export interface KanbanDropResult {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  /**
   * Destination index, already adjusted for the card's removal. `-1` means
   * "append to the end of the target column" (dropped on the column body or an
   * empty column rather than on a specific card).
   */
  toIndex: number;
}

export interface KanbanColumnDropResult {
  columnId: string;
  fromIndex: number;
  /** Destination index in the column order, already adjusted for removal. */
  toIndex: number;
}

/**
 * Apply a column reorder to an ordered list of column ids, returning a new
 * array. Locates the column by id so a stale `fromIndex` can't corrupt order.
 */
export function applyColumnDrop(
  order: string[],
  result: KanbanColumnDropResult,
): string[] {
  const { columnId, toIndex } = result;
  const from = order.indexOf(columnId);
  if (from === -1) return order;

  const next = order.slice();
  next.splice(from, 1);
  const insertAt = toIndex === -1 ? next.length : clamp(toIndex, 0, next.length);
  next.splice(insertAt, 0, columnId);
  return next;
}

/**
 * Apply a drop result to a `KanbanColumns` map, returning a new map. Safe
 * against stale indices (locates the card by id) and clamps the destination.
 */
export function applyCardDrop(
  columns: KanbanColumns,
  result: KanbanDropResult,
): KanbanColumns {
  const { cardId, fromColumnId, toColumnId, toIndex } = result;
  if (!columns[fromColumnId] || !columns[toColumnId]) return columns;

  const next: KanbanColumns = { ...columns };

  // Remove from source.
  const source = next[fromColumnId].slice();
  const removeAt = source.indexOf(cardId);
  if (removeAt === -1) return columns;
  source.splice(removeAt, 1);
  next[fromColumnId] = source;

  // Insert into destination (which is the just-updated source array when the
  // move is within one column).
  const target =
    toColumnId === fromColumnId ? source : next[toColumnId].slice();
  const insertAt = toIndex === -1 ? target.length : clamp(toIndex, 0, target.length);
  target.splice(insertAt, 0, cardId);
  next[toColumnId] = target;

  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
