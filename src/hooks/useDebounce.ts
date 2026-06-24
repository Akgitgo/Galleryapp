import { useState, useEffect } from 'react';

/**
 * useDebounce
 * Returns a debounced value that only updates after `delay` ms of inactivity.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 350);
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
