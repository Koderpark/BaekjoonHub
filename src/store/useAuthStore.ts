import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GitHubConfig } from '@/types/github';

interface AuthState {
  token: string | null;
  username: string | null;
  repo: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  githubConfig: GitHubConfig | null;
  setCredentials: (token: string, username: string) => Promise<void>;
  setRepo: (repo: string) => void;
  clearCredentials: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    token: null,
    username: null,
    repo: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    githubConfig: null,

    setCredentials: async (token: string, username: string) => {
      set({ loading: true });
      try {
        // Chrome 스토리지에 저장
        await chrome.storage.local.set({
          BaekjoonHub_token: token,
          BaekjoonHub_username: username,
        });

        set({
          token,
          username,
          isAuthenticated: true,
          error: null,
        });
      } catch (error) {
        set({
          error: 'Failed to save credentials',
        });
      } finally {
        set({ loading: false });
      }
    },

    setRepo: (repo: string) => {
      set({ repo });
      chrome.storage.local.set({ BaekjoonHub_hook: repo });
    },

    clearCredentials: async () => {
      set({ loading: true });
      try {
        await chrome.storage.local.remove([
          'BaekjoonHub_token',
          'BaekjoonHub_username',
          'BaekjoonHub_hook',
        ]);

        set({
          token: null,
          username: null,
          repo: null,
          isAuthenticated: false,
          githubConfig: null,
        });
      } catch (error) {
        set({
          error: 'Failed to clear credentials',
        });
      } finally {
        set({ loading: false });
      }
    },

    setLoading: (loading: boolean) => set({ loading }),

    setError: (error: string | null) => set({ error }),

    validateToken: async () => {
      const { token } = get();
      if (!token) return false;

      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          await get().clearCredentials();
          return false;
        }

        return true;
      } catch (error) {
        set({ error: 'Failed to validate token' });
        return false;
      }
    },
  }))
);
