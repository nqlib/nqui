import * as React from "react";
import type { DragData } from "./types";

/**
 * Keeps a ref pointing at the latest value every render, without triggering the
 * effect that consumes it. Used so `getInitialData` / `getData` read fresh
 * props at drag time while the underlying Pragmatic binding stays attached.
 */
export function useLatestRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);
  React.useInsertionEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** Resolve a `data` prop that may be a value or a factory. */
export function resolveData(
  data: DragData | (() => DragData) | undefined,
  extra?: DragData,
): DragData {
  const base = typeof data === "function" ? data() : (data ?? {});
  return extra ? { ...base, ...extra } : { ...base };
}
