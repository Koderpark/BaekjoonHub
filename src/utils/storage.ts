/*
storage.ts

Chrome 로컬 스토리지 관련 유틸리티
로컬 스토리지에서 값 가져오기, 저장하기, 삭제하기
초기화 및 동기화
Stats 객체 초기화 및 업데이트
경로로 SHA 가져오기, 저장하기
*/
import { StorageKey } from '@/types/common';
import { Stats } from '@/types/common';

/**
 * Chrome 로컬 스토리지에서 값 가져오기
 */
export const getFromStorage = async <T>(key: StorageKey): Promise<T | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] || null);
    });
  });
};

/**
 * Chrome 로컬 스토리지에 값 저장하기
 */
export const saveToStorage = async <T>(key: StorageKey, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
};

/**
 * Chrome 로컬 스토리지에서 값 삭제하기
 */
export const removeFromStorage = async (keys: StorageKey[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
};

/**
 * Chrome 로컬 스토리지 초기화 및 동기화
 */
export const initializeStorage = async (): Promise<void> => {
  const isSync = await getFromStorage('isSync');
  if (!isSync) {
    const keys: StorageKey[] = [
      'BaekjoonHub_token',
      'BaekjoonHub_username',
      'BaekjoonHub_hook',
      'stats',
      'mode_type',
    ];

    // Chrome sync storage에서 local storage로 동기화
    for (const key of keys) {
      const value = await new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => resolve(result[key]));
      });
      if (value) {
        await saveToStorage(key, value);
      }
    }

    await saveToStorage('isSync', true);
  }
};

/**
 * Stats 객체 초기화 및 업데이트
 */
export const initializeStats = async (): Promise<void> => {
  let stats = await getFromStorage<Stats>('stats');
  const currentVersion = chrome.runtime.getManifest().version;

  if (!stats || stats.version !== currentVersion) {
    stats = {
      version: currentVersion,
      branches: stats?.branches || {},
      submission: stats?.submission || {},
      problems: stats?.problems || {},
    };
    await saveToStorage('stats', stats);
  }
};

/**
 * Chrome 로컬 스토리지에서 경로로 SHA 가져오기
 */
export const getSHAFromPath = async (path: string): Promise<string | null> => {
  const stats = await getFromStorage<Stats>('stats');
  if (!stats) return null;

  let current = stats.submission;
  const pathParts = path.split('/').filter((p) => p !== '');

  for (const part of pathParts.slice(0, -1)) {
    if (!current[part]) return null;
    current = current[part];
  }

  return current[pathParts[pathParts.length - 1]] || null;
};

/**
 * Chrome 로컬 스토리지에 경로로 SHA 저장하기
 */
export const saveSHAToPath = async (path: string, sha: string): Promise<void> => {
  const stats = await getFromStorage<Stats>('stats');
  if (!stats) return;

  let current = stats.submission;
  const pathParts = path.split('/').filter((p) => p !== '');

  for (const part of pathParts.slice(0, -1)) {
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[pathParts[pathParts.length - 1]] = sha;
  await saveToStorage('stats', stats);
};
