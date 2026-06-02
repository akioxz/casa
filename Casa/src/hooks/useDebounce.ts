import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value, commonly used for search inputs.
 * @param value - The input value to debounce
 * @param delay - The delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
