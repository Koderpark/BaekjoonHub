/*
Popup.tsx

익스텐션 팝업 UI
GitHub 인증 상태 표시
활성화/비활성화 토글
레포지토리 정보 표시
소셜 링크
*/
import React from 'react';
import { Card, GitHubAuthButton } from '@/components';
import { useLocalStorage } from '@/hooks';
import { useGitHubAuth } from '@/hooks';

export default function Popup() {
  const { value: mode } = useLocalStorage('mode_type', 'hook');
  const { value: repoUrl } = useLocalStorage('repo', '');
  const { value: enabled, setValue: setEnabled } = useLocalStorage('bjhEnable', true);
  const { isAuthenticated } = useGitHubAuth();

  const handleToggleEnabled = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="w-[350px] p-4 bg-background text-foreground">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          Baekjoon<span className="text-[#0078c3]">Hub</span>
        </h1>
        <p className="text-sm text-muted-foreground">Sync your code from BOJ to GitHub</p>
      </div>

      {/* 인증 모드 */}
      {!isAuthenticated && (
        <Card className="mb-4">
          <Card.Content>
            <p className="text-sm mb-4">Authenticate with GitHub to use BaekjoonHub</p>
            <GitHubAuthButton className="w-full" />
          </Card.Content>
        </Card>
      )}

      {/* 레포지토리 정보 */}
      {isAuthenticated && mode === 'commit' && (
        <Card className="mb-4">
          <Card.Content>
            <p className="text-sm text-muted-foreground mb-2">Your Repository</p>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {repoUrl.replace('https://github.com/', '')}
            </a>
          </Card.Content>
        </Card>
      )}

      {/* 후크 모드 */}
      {isAuthenticated && mode === 'hook' && (
        <Card className="mb-4">
          <Card.Content>
            <p className="text-sm mb-4">Set up repository hook to use BaekjoonHub</p>
            <a
              href="welcome.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Set up Hook
            </a>
          </Card.Content>
        </Card>
      )}

      {/* 활성화 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable BaekjoonHub</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggleEnabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>

      {/* 소셜 링크 */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <a
          href="https://github.com/BaekjoonHub/BaekjoonHub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
          title="BaekjoonHub GitHub"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </a>
        <a
          href="mailto:flaxinger@gmail.com"
          className="text-muted-foreground hover:text-foreground"
          title="Email"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
        <a
          href="https://github.com/BaekjoonHub/BaekjoonHub/blob/main/Patch_Notes.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
          title="Patch Notes"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </a>
      </div>
    </div>
  );
}
