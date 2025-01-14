/*
useGitHubAuth.ts

GitHub OAuth 인증 처리
토큰 및 사용자 정보 관리
로그인/로그아웃 기능
*/
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { GitHubError } from '@/types/github';

interface GitHubAuthState {
  token: string | null;
  username: string | null;
  loading: boolean;
  error: GitHubError | null;
}

interface UseGitHubAuthReturn extends GitHubAuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useGitHubAuth(): UseGitHubAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GitHubError | null>(null);
  const {
    value: token,
    setValue: setToken,
    removeValue: removeToken,
  } = useLocalStorage<string | null>('BaekjoonHub_token', null);
  const {
    value: username,
    setValue: setUsername,
    removeValue: removeUsername,
  } = useLocalStorage<string | null>('BaekjoonHub_username', null);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // GitHub OAuth 시작
      await chrome.storage.local.set({ pipe_baekjoonhub: true });

      // OAuth URL 생성
      const AUTH_URL = 'https://github.com/login/oauth/authorize';
      const CLIENT_ID = '975f8d5cf6686dd1faed';
      const SCOPE = 'repo';
      const url = `${AUTH_URL}?client_id=${CLIENT_ID}&scope=${SCOPE}`;

      // 새 탭에서 GitHub OAuth 페이지 열기
      chrome.tabs.create({ url, active: true });

      // background script에서 처리 완료될 때까지 대기
      const handleAuth = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.BaekjoonHub_token) {
          chrome.storage.onChanged.removeListener(handleAuth);
          setToken(changes.BaekjoonHub_token.newValue);
        }
        if (changes.BaekjoonHub_username) {
          setUsername(changes.BaekjoonHub_username.newValue);
        }
      };

      chrome.storage.onChanged.addListener(handleAuth);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Authentication failed',
        status: 500,
      });
    } finally {
      setLoading(false);
    }
  }, [setToken, setUsername]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        removeToken(),
        removeUsername(),
        chrome.storage.local.remove(['pipe_baekjoonhub']),
      ]);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Logout failed',
        status: 500,
      });
    } finally {
      setLoading(false);
    }
  }, [removeToken, removeUsername]);

  return {
    token,
    username,
    loading,
    error,
    login,
    logout,
    isAuthenticated: Boolean(token && username),
  };
}
