
import { useState, useEffect } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item && item !== '[]') {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage для ключа "${key}", используем начальные данные:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Ошибка записи в localStorage для ключа "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
