import { useEffect, useState } from 'react';

/**
 * Hook to detect if the device supports touch events
 * Returns true if touch events are detected, false otherwise
 * Universal hook available for all components
 */
export function useDetectTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const handleTouch = () => {
      setIsTouch(true);
      removeListener();
    };

    const removeListener = () => {
      document.removeEventListener('touchstart', handleTouch);
    };

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return removeListener;
  }, []);

  return isTouch;
}