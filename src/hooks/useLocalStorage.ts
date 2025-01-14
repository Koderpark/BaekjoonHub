/*
useLocalStorage.ts

Chrome 스토리지 상태 관리
비동기 저장/로드 처리
타입 안전성 보장
*/
import { useState, useEffect, useCallback } from 'react';
import { StorageKey } from '@/types/common';

export function useLocalStorage<T>(key: StorageKey, initialValue: T) {
  // 상태 초기화 함수
  const initialize = useCallback(async () => {
    try {
      const item = await chrome.storage.local.get(key);
      return item[key] ?? initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 값 로드
  useEffect(() => {
    initialize().then((value) => {
      setStoredValue(value);
      setIsLoading(false);
    });
  }, [initialize]);

  // 값을 업데이트하는 함수
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await chrome.storage.local.set({ [key]: valueToStore });
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
      }
    },
    [key, storedValue]
  );

  // 값을 삭제하는 함수
  const removeValue = useCallback(async () => {
    try {
      setStoredValue(initialValue);
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue, isLoading };
}
