/*
useSubmission.ts

문제 제출 데이터 처리
GitHub 업로드 로직
플랫폼별 결과 생성
중복 제출 방지
*/
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Platform } from '@/types/common';
import { Submission, SubmissionResult } from '@/types/submission';
import { GitHub } from '@/utils/github';
import { calculateBlobSHA } from '@/utils/github';
import { isNull } from '@/utils/validation';

interface UseSubmissionProps {
  platform: Platform;
}

interface UseSubmissionReturn {
  isUploading: boolean;
  lastUpload: SubmissionResult | null;
  error: Error | null;
  uploadSubmission: (submission: Submission) => Promise<void>;
}

export function useSubmission({ platform }: UseSubmissionProps): UseSubmissionReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { value: token } = useLocalStorage<string | null>('BaekjoonHub_token', null);
  const { value: hook } = useLocalStorage<string | null>('BaekjoonHub_hook', null);
  const { value: stats, setValue: setStats } = useLocalStorage('stats', {
    version: '0.0.0',
    branches: {},
    submission: {},
    problems: {},
  });

  const uploadSubmission = useCallback(
    async (submission: Submission) => {
      if (isNull(token) || isNull(hook)) {
        throw new Error('GitHub token or hook not found');
      }

      setIsUploading(true);
      setError(null);

      try {
        const github = new GitHub(hook, token);

        // 현재 버전과 stats 버전이 다르면 업데이트
        const currentVersion = chrome.runtime.getManifest().version;
        if (stats.version !== currentVersion) {
          const tree = await github.getTree();
          const updatedStats = {
            version: currentVersion,
            branches: { [hook]: await github.getDefaultBranchOnRepo() },
            submission: tree.reduce(
              (acc, item) => {
                acc[item.path] = item.sha;
                return acc;
              },
              {} as Record<string, string>
            ),
            problems: stats.problems,
          };
          await setStats(updatedStats);
        }

        // 기존에 업로드된 파일이 있는지 확인
        const submissionResult = await makeSubmissionResult(submission);
        const existingSHA =
          stats.submission[`${hook}/${submissionResult.directory}/${submissionResult.fileName}`];
        const currentSHA = calculateBlobSHA(submissionResult.code);

        // 이미 업로드된 파일이면 스킵
        if (existingSHA === currentSHA) {
          setLastUpload(submissionResult);
          return;
        }

        // GitHub에 업로드
        const { refSHA, ref } = await github.getReference();
        const source = await github.createBlob(
          submissionResult.code,
          `${submissionResult.directory}/${submissionResult.fileName}`
        );
        const readme = await github.createBlob(
          submissionResult.readme,
          `${submissionResult.directory}/README.md`
        );
        const treeSHA = await github.createTree(refSHA, [source, readme]);
        const commitSHA = await github.createCommit(submissionResult.message, treeSHA, refSHA);
        await github.updateHead(ref, commitSHA);

        // stats 업데이트
        const updatedStats = {
          ...stats,
          submission: {
            ...stats.submission,
            [`${hook}/${source.path}`]: source.sha,
            [`${hook}/${readme.path}`]: readme.sha,
          },
        };
        await setStats(updatedStats);

        setLastUpload(submissionResult);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Upload failed'));
      } finally {
        setIsUploading(false);
      }
    },
    [token, hook, stats, setStats]
  );

  return {
    isUploading,
    lastUpload,
    error,
    uploadSubmission,
  };
}

// 제출 결과 생성 함수
async function makeSubmissionResult(submission: Submission): Promise<SubmissionResult> {
  // 플랫폼별 결과 생성 로직
  switch (submission.platform) {
    case 'baekjoon':
      return makeBojSubmissionResult(submission);
    case 'programmers':
      return makeProgrammersSubmissionResult(submission);
    case 'swexpertacademy':
      return makeSweaSubmissionResult(submission);
    case 'goormlevel':
      return makeGoormlevelSubmissionResult(submission);
    default:
      throw new Error('Unsupported platform');
  }
}

// 각 플랫폼별 결과 생성 함수
async function makeBojSubmissionResult(submission: Submission): Promise<SubmissionResult> {
  // BOJ 전용 로직
  return {} as SubmissionResult; // 실제 구현 필요
}

async function makeProgrammersSubmissionResult(submission: Submission): Promise<SubmissionResult> {
  // 프로그래머스 전용 로직
  return {} as SubmissionResult; // 실제 구현 필요
}

async function makeSweaSubmissionResult(submission: Submission): Promise<SubmissionResult> {
  // SWEA 전용 로직
  return {} as SubmissionResult; // 실제 구현 필요
}

async function makeGoormlevelSubmissionResult(submission: Submission): Promise<SubmissionResult> {
  // 구름레벨 전용 로직
  return {} as SubmissionResult; // 실제 구현 필요
}
