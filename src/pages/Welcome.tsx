/*
Welcome.tsx

초기 설정 페이지
레포지토리 생성/연결
파일 구조 옵션 설정
GitHub API 통신
설정 저장
*/
import React, { useState } from 'react';
import { Card, Button } from '@/components';
import { useLocalStorage, useToast } from '@/hooks';
import { useGitHubAuth } from '@/hooks';

type RepoOption = 'new' | 'link';
type OrganizeOption = 'platform' | 'language';

export default function Welcome() {
  const [repoOption, setRepoOption] = useState<RepoOption | ''>('');
  const [repoName, setRepoName] = useState('');
  const [organizeBy, setOrganizeBy] = useState<OrganizeOption>('platform');

  const { value: token } = useLocalStorage('BaekjoonHub_token', null);
  const { value: username } = useLocalStorage('BaekjoonHub_username', '');
  const toast = useToast();

  const handleCreateRepo = async () => {
    if (!repoOption) {
      toast.error('Please select repository option');
      return;
    }

    if (!repoName.trim()) {
      toast.error('Please enter repository name');
      return;
    }

    try {
      await chrome.storage.local.set({ BaekjoonHub_OrgOption: organizeBy });

      if (!token) {
        throw new Error('GitHub token not found');
      }

      if (repoOption === 'new') {
        // 새 레포지토리 생성
        await createNewRepo(token, repoName);
      } else {
        // 기존 레포지토리 연결
        await linkExistingRepo(token, username, repoName);
      }

      toast.success('Successfully set up repository!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set up repository');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            Baekjoon<span className="text-[#0078c3]">Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Automatically sync your code from BOJ to GitHub
          </p>
        </div>

        <Card className="mb-8">
          <Card.Header>
            <Card.Title>Repository Setup</Card.Title>
            <Card.Description>Choose how you want to store your solutions</Card.Description>
          </Card.Header>

          <Card.Content>
            <div className="space-y-6">
              {/* Repository Option */}
              <div>
                <label className="block text-sm font-medium mb-2">Repository Option</label>
                <select
                  value={repoOption}
                  onChange={(e) => setRepoOption(e.target.value as RepoOption)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                >
                  <option value="">Select an option</option>
                  <option value="new">Create a new repository</option>
                  <option value="link">Link an existing repository</option>
                </select>
              </div>

              {/* Repository Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="Enter repository name"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                />
              </div>

              {/* Organization Option */}
              <div>
                <label className="block text-sm font-medium mb-2">Organize Solutions By</label>
                <select
                  value={organizeBy}
                  onChange={(e) => setOrganizeBy(e.target.value as OrganizeOption)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2"
                >
                  <option value="platform">Platform (BOJ, Programmers, etc.)</option>
                  <option value="language">Programming Language</option>
                </select>
              </div>
            </div>
          </Card.Content>

          <Card.Footer>
            <Button
              onClick={handleCreateRepo}
              disabled={!repoOption || !repoName.trim()}
              className="w-full"
            >
              Set Up Repository
            </Button>
          </Card.Footer>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Want to contribute? Check out our{' '}
            <a
              href="https://github.com/BaekjoonHub/BaekjoonHub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub repository
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

async function createNewRepo(token: string, name: string) {
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      private: true,
      auto_init: true,
      description: 'Auto-generated by BaekjoonHub',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create repository');
  }

  const data = await response.json();
  await chrome.storage.local.set({
    mode_type: 'commit',
    repo: data.html_url,
    BaekjoonHub_hook: data.full_name,
  });
}

async function linkExistingRepo(token: string, username: string, name: string) {
  const response = await fetch(`https://api.github.com/repos/${username}/${name}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Repository not found or access denied');
  }

  const data = await response.json();
  await chrome.storage.local.set({
    mode_type: 'commit',
    repo: data.html_url,
    BaekjoonHub_hook: data.full_name,
  });
}
