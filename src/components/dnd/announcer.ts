"use client";

import { announce, cleanup } from "@atlaskit/pragmatic-drag-and-drop-live-region";
import * as React from "react";

/**
 * Returns a stable `announce(message)` for screen-reader announcements during
 * drag operations (e.g. "Card moved to In Progress, position 2 of 5"). The
 * shared live region is cleaned up when the last consumer unmounts.
 *
 * Wraps `@atlaskit/pragmatic-drag-and-drop-live-region`.
 */
export function useAnnouncer(): (message: string) => void {
  React.useEffect(() => cleanup, []);
  return React.useCallback((message: string) => announce(message), []);
}

export { announce as announceLive, cleanup as cleanupLiveRegion };
