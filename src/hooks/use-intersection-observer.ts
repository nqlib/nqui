'use client';

import * as React from 'react';

export interface UseInViewOptions {
  once?: boolean;
  margin?: string;
}

/**
 * Lightweight useInView using native IntersectionObserver.
 * Replaces motion's useInView to avoid bundling motion for CodeEditor.
 */
export function useInView(
  ref: React.RefObject<Element | null>,
  options?: UseInViewOptions
): { isInView: boolean } {
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          if (options?.once) observer.disconnect();
        }
      },
      { rootMargin: options?.margin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options?.once, options?.margin]);

  return { isInView };
}
