import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  // Using lazy initialization to avoid reading from localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Guard against "undefined", "null", or empty strings which cause JSON.parse to fail
      if (!item || item === "undefined" || item === "null" || item.trim() === "") {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      // If parsing fails, it might be corrupt. Return initial value.
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      setStoredValue((oldValue) => {
        const valueToStore = value instanceof Function ? value(oldValue) : value;
        
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (writeError) {
            console.error(`Error writing to localStorage key “${key}”:`, writeError);
          }
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}