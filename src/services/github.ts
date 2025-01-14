/*
github.ts

GitHub API 통신
레포지토리 조작
커밋 생성
에러 처리
*/

import { GitHubBlob, GitHubReference, GitHubTree, GitHubError } from '@/types/github';

export class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token: string;
  private readonly hook: string;

  constructor(hook: string, token: string) {
    this.hook = hook;
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'GitHub API request failed');
      }

      return response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 저장소의 기본 브랜치 가져오기
   */
  async getDefaultBranch(): Promise<string> {
    const data = await this.request<{ default_branch: string }>(`/repos/${this.hook}`);
    return data.default_branch;
  }

  /**
   * 레퍼런스 가져오기
   */
  async getReference(branch = 'main'): Promise<GitHubReference> {
    const data = await this.request<{
      ref: string;
      object: { sha: string };
    }>(`/repos/${this.hook}/git/refs/heads/${branch}`);

    return {
      ref: data.ref,
      refSHA: data.object.sha,
    };
  }

  /**
   * Blob 생성하기
   */
  async createBlob(content: string, path: string): Promise<GitHubBlob> {
    const data = await this.request<{ sha: string }>(`/repos/${this.hook}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: btoa(unescape(encodeURIComponent(content))),
        encoding: 'base64',
      }),
    });

    return {
      path,
      sha: data.sha,
      mode: '100644',
      type: 'blob',
    };
  }

  /**
   * 트리 생성하기
   */
  async createTree(baseTreeSHA: string, tree: GitHubBlob[]): Promise<string> {
    const data = await this.request<{ sha: string }>(`/repos/${this.hook}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTreeSHA,
        tree,
      }),
    });

    return data.sha;
  }

  /**
   * 커밋 생성하기
   */
  async createCommit(message: string, treeSHA: string, parentSHA: string): Promise<string> {
    const data = await this.request<{ sha: string }>(`/repos/${this.hook}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: treeSHA,
        parents: [parentSHA],
      }),
    });

    return data.sha;
  }

  /**
   * 레퍼런스 업데이트하기
   */
  async updateRef(ref: string, sha: string, force = true): Promise<void> {
    await this.request(`/repos/${this.hook}/git/${ref}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sha,
        force,
      }),
    });
  }

  /**
   * 전체 트리 가져오기
   */
  async getTree(recursive = true): Promise<GitHubTree['tree']> {
    const data = await this.request<GitHubTree>(
      `/repos/${this.hook}/git/trees/HEAD${recursive ? '?recursive=1' : ''}`
    );
    return data.tree;
  }

  /**
   * 에러 처리
   */
  private handleError(error: any): GitHubError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
      };
    }
    return {
      message: 'Unknown error occurred',
      status: 500,
    };
  }
}
