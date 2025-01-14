/*
storage.ts

Chrome Storage 관리
값 가져오기/저장하기
마이그레이션
변경 감지
*/
import { StorageKey } from '@/types/common';

export class StorageService {
  /**
   * 값 가져오기
   */
  static async get<T>(key: StorageKey): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  }

  /**
   * 값 저장하기
   */
  static async set<T>(key: StorageKey, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  /**
   * 값 삭제하기
   */
  static async remove(keys: StorageKey[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  }

  /**
   * 모든 값 가져오기
   */
  static async getAll<T extends Record<StorageKey, unknown>>(): Promise<Partial<T>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result as Partial<T>);
      });
    });
  }

  /**
   * 모든 값 초기화
   */
  static async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }

  /**
   * 설정 마이그레이션
   */
  static async migrate(): Promise<void> {
    const keys: StorageKey[] = [
      'BaekjoonHub_token',
      'BaekjoonHub_username',
      'BaekjoonHub_hook',
      'stats',
      'mode_type',
    ];

    // sync에서 local로 데이터 마이그레이션
    const syncData = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });

    if (Object.keys(syncData).length > 0) {
      await this.set('isSync', true);
      await Promise.all(
        Object.entries(syncData).map(([key, value]) => this.set(key as StorageKey, value))
      );
      await new Promise<void>((resolve) => {
        chrome.storage.sync.clear(resolve);
      });
    }
  }

  /**
   * 변경 감지 리스너 등록
   */
  static addChangeListener(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    chrome.storage.onChanged.addListener(callback);
  }

  /**
   * 변경 감지 리스너 제거
   */
  static removeChangeListener(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void
  ): void {
    chrome.storage.onChanged.removeListener(callback);
  }
}
