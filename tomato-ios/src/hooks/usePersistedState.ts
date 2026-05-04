import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (stored !== null) {
          setState(JSON.parse(stored));
        }
      })
      .catch(() => {});
  }, [key]);

  const setValue = (value: T) => {
    setState(value);
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  };

  return [state, setValue];
}
