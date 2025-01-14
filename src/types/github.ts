/*
github.ts

GitHub 관련 타입 정의
API 요청/응답 인터페이스
커밋, 블롭, 트리 등 Git 객체 타입
*/
export interface GitHubConfig {
  token: string;
  username: string;
  repo: string;
}

export interface GitHubBlob {
  path: string;
  sha: string;
  mode: string;
  type: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  tree: string;
  parent: string[];
}

export interface GitHubReference {
  ref: string;
  refSHA: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
  }>;
}

export interface GitHubCreateRepoOptions {
  name: string;
  private: boolean;
  description?: string;
  auto_init?: boolean;
}

export interface GitHubError {
  message: string;
  status: number;
}

export interface GitHubUploadResult {
  success: boolean;
  error?: GitHubError;
  url?: string;
}

export type GitHubRepoMode = 'commit' | 'hook';

export interface CommitData {
  message: string;
  content: string;
  sha?: string;
  branch?: string;
}
